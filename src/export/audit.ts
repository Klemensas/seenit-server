import { writeFileSync } from 'fs';
import { resolve } from 'path';
import knexConnector, { Knex } from 'knex';
import { QueryBuilder } from 'objection';

import { knex } from '../config';
import * as envConfig from '../config/environment';

import { Movie } from '../models/movie/model';
import { Tv } from '../models/tv/model';

// TODO: test this out more, it's more of a rough draft now. It also might be a bad idea since auditing against tmdb will usually have diffs

async function batchLoadItems<T extends Movie | Tv>(
  query: QueryBuilder<T, T[]>,
  batchSize = 100000,
) {
  let loadedItems: T[] = [];

  async function load(offset = 1) {
    console.time(`batch #${offset}`);
    const { results } = await query.page(offset, batchSize);
    loadedItems = loadedItems.concat(results);

    console.timeEnd(`batch #${offset}`);
  }

  await load();

  return loadedItems;
}

function listToAuditedTmdbMap<T extends Movie | Tv>(list: T[]) {
  type AuditedItem = Omit<T, 'id' | 'createdAt' | 'updatedAt' | 'popularity'>;

  return list.reduce((acc: Record<string, AuditedItem>, item) => {
    const { id, updatedAt, createdAt, popularity, ...auditedProps } = item;
    acc[item.tmdbId] = auditedProps as AuditedItem;

    return acc;
  }, {});
}

function audit<T extends Movie | Tv>(list: T[], auditList: T[]) {
  return list.reduce(
    (acc, item) => {
      const auditItem = acc.auditMap[item.tmdbId];
      const listItem = acc.listMap[item.tmdbId];

      // Audit map has no matching item leave it inside list map
      if (!auditItem) return acc;

      // Clean list since both items were found
      delete acc.auditMap[item.tmdbId];
      delete acc.listMap[item.tmdbId];

      // Push mismatch
      if (JSON.stringify(listItem) !== JSON.stringify(auditItem)) {
        const props = Array.from(
          new Set([...Object.keys(listItem), ...Object.keys(auditItem)]),
        );

        const diffs = props.filter(
          (prop) => listItem[prop] !== auditItem[prop],
        );
        acc.misatches.push({
          listItem,
          auditItem,
          diffs,
        });
      }

      return acc;
    },
    {
      listMap: listToAuditedTmdbMap(list),
      auditMap: listToAuditedTmdbMap(auditList),
      misatches: [],
    },
  );
}
async function init(auditTarget: Knex) {
  console.time('load movies');
  const localMovies = await batchLoadItems(
    Movie.query(knex).orderBy('updatedAt', 'desc'),
  );
  const targetMovies = await batchLoadItems(
    Movie.query(auditTarget).orderBy('updatedAt', 'desc'),
  );
  console.timeEnd('load movies');
  console.time('perform movie audit');
  const auditMoviesResults = audit(localMovies, targetMovies);
  console.timeEnd('perform movie audit');

  console.log(
    'movie audit done',
    Object.keys(auditMoviesResults.listMap).length, // list items that are missing in the audit list
    Object.keys(auditMoviesResults.auditMap).length, // audit items that are missing inside the list
    auditMoviesResults.misatches.length, // items that differed between list and audit
  );

  writeFileSync(
    resolve(__dirname, 'auditMoviesResults.json'),
    JSON.stringify(auditMoviesResults.misatches, null, 2),
  );

  // Copy TV version
  console.time('load tv');
  const localTv = await batchLoadItems(
    Tv.query(knex)
      .orderBy('updatedAt', 'desc')
      .withGraphFetched('[seasons.episodes]'),
    10000,
  );
  const targetTv = await batchLoadItems(
    Tv.query(auditTarget)
      .orderBy('updatedAt', 'desc')
      .withGraphFetched('[seasons.episodes]'),
    10000,
  );
  console.timeEnd('load tv');

  console.time('perform tv audit');
  const auditTvResults = audit(localTv, targetTv);
  console.timeEnd('perform tv audit');

  console.log(
    'movie audit done',
    Object.keys(auditTvResults.listMap).length, // list items that are missing in the audit list
    Object.keys(auditTvResults.auditMap).length, // audit items that are missing inside the list
    auditTvResults.misatches.length, // items that differed between list and audit
  );

  writeFileSync(
    resolve(__dirname, 'auditTvResults.json'),
    JSON.stringify(auditTvResults.misatches, null, 2),
  );
}

const targetKnex = knexConnector({
  ...envConfig.knex.options,
  connection: process.env.REMOTE_DB_CONNECTION,
});
init(targetKnex);
