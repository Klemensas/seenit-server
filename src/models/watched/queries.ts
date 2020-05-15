import * as Knex from 'knex';
import { Transaction, PartialModelGraph } from 'objection';

import { knex } from '../../config';
import { perPage } from '../../config/constants';
import { Watched } from './model';

export function getWatchedById(
  id: string,
  connection: Transaction | Knex = knex,
) {
  return Watched.query(connection).findById(id);
}

export function deleteWatched(
  ids: string[],
  connection: Transaction | Knex = knex,
) {
  return Watched.query(connection).delete().whereIn('id', ids);
}

export function getPaginatedWatched(
  where: Partial<Watched>,
  pagination: { count: number; after: string | number } = {
    count: perPage,
    after: Date.now(),
  },
  connection: Transaction | Knex = knex,
) {
  return Watched.query(connection)
    .where(where)
    .orderBy('Watched.createdAt', 'DESC')
    .where('Watched.createdAt', '<', pagination.after)
    .page(0, pagination.count);
}

export async function getWatchedWithReviews(
  where: Partial<Watched>,
  pagination: { count: number; after: string | number } = {
    count: perPage,
    after: Date.now(),
  },
  connection: Transaction | Knex = knex,
) {
  return getPaginatedWatched(
    Object.entries(where).reduce(
      (acc, [key, value]) => ({ ...acc, [`Watched.${key}`]: value }),
      {},
    ),
    pagination,
    connection,
  ).withGraphJoined('review', { joinOperation: 'innerJoin' });
}

export function createWatched(
  watched: Partial<Watched>,
  connection: Transaction | Knex = knex,
) {
  return Watched.query(connection).insert(watched);
}

export function createWatchedGraph(
  watched: PartialModelGraph<Watched, Watched[]>,
  connection: Transaction | Knex = knex,
) {
  return Watched.query(connection)
    .allowGraph('[review, rating]')
    .insertGraph(watched);
}

export function upsertWatchedGraph(
  watched: Partial<Watched>,
  connection: Transaction | Knex = knex,
) {
  return Watched.query(connection)
    .allowGraph('[review, rating]')
    .upsertGraphAndFetch(watched);
}
