import { knex } from '../config';
import TMDB, { MediaType } from '../services/TMDB';
import { Movie } from '../models/movie';
import { Tv } from '../models/tv';
import { DailyExports } from './dailyExport';
import { DailyChanges } from '../models/dailyChanges';

const exportDate = '2019-06-28';

export enum ExportPaths {
  'movie' = '/movie/changes',
  'tv' = '/tv/changes',
}

export async function getRangeChanges(type: MediaType, from: Date, to: Date = new Date()) {
  const path = ExportPaths[type];
  const fromString = [from.getUTCFullYear(), String(from.getUTCMonth() + 1).padStart(2, '0'), String(from.getUTCDate()).padStart(2, '0')].join('-');
  const toString = [to.getUTCFullYear(), String(to.getUTCMonth() + 1).padStart(2, '0'), String(to.getUTCDate()).padStart(2, '0')].join('-');

  const changes = await getPage(path, fromString, toString);
  const changedIds = changes.filter(({ adult }) => !adult).map(({ id }) => id);
  const model: any = type === 'movie' ? Movie : Tv;

  const [{ items, deletedIds }, currentItems] = await Promise.all([
    loadItems(changedIds, type),
    model.query(knex).whereIn('tmdbId', changedIds),
  ]);

  let updated = 0;
  await Promise.all([
    model.query(knex).upsertGraph(items.map(({ id, ...item}) => {
      const storedItem = currentItems.find(({ tmdbId }) => tmdbId === id);
      const newItem = {
        ...item,
        tmdbId: id,
      };

      if (storedItem) {
        newItem.id = storedItem.id;
        updated++;
      }

      return newItem;
    }), {
      noDelete: true,
    }),
    model.query(knex).whereIn('tmdbId', deletedIds).del(),
  ]);

  return {
    updated,
    inserted: items.length - updated,
    deleted: deletedIds.length,
  };
}

async function getPage(path: ExportPaths, from: string, to: string, page: number = 1) {
  const { data } = await TMDB.get(path, {
    params: {
      page,
      start_date: from,
      end_date: to,
    },
  });

  let items = [];
  if (data.total_pages !== data.page) {
    items = await getPage(path, from, to, page + 1);
  }
  return data.results.concat(items);
}

async function loadItems(ids: number[], type: MediaType) {
  const list = [...ids];
  const deletedIds = [];
  const items = [];
  const { data, id, limit, remainingLimit } = await DailyExports.fetchItemWithDeletion(list.shift(), type);
  if (data) {
    items.push(data);
  } else {
    deletedIds.push(id);
  }
  let currentLimit = remainingLimit;

  let request = [];
  while (list.length) {
    if (currentLimit) {
      currentLimit--;
      request.push(DailyExports.fetchItemWithDeletion(list.shift(), type));
      continue;
    }

    const responses = await Promise.all(request);
    responses.forEach(({ data, id }) => {
      if (!data) {
        deletedIds.push(id);
        return;
      }
      items.push(data)
    });

    const lastItem = DailyExports.lastBatchItem(responses);
    request = [];

    if (lastItem.remainingLimit) {
      currentLimit = lastItem.remainingLimit;
      continue;
    }

    await new Promise((resolve) => setTimeout(resolve, (lastItem.nextBatch - Math.floor(Date.now() / 1000)) * 1000 + 1000));
    currentLimit = limit;
  }
  return { items, deletedIds };
}

export async function storeChanges() {
  const lastChanges = await DailyChanges.query(knex).orderBy('createdAt', 'desc').limit(1).first().debug();

  const lastDate = lastChanges ? +lastChanges.createdAt : exportDate;
  const date = new Date(lastDate);
  const endDate = new Date(+date + 86400000);

  if (+endDate + 72000000 > Date.now()) {
    console.log(`You're all good, less than 20h passed since last change update`);
    return null;
  }

  console.time('Changes');
  const movieChanges = await getRangeChanges('movie', date, endDate);
  const tvChanges = await getRangeChanges('tv', date, endDate);

  console.time('Change insertion');
  const insertedItems = await DailyChanges.query(knex).insert([{
    type: 'movie',
    ...movieChanges,
    createdAt: +endDate,
    updatedAt: +endDate,
  }, {
    type: 'tv',
    ...tvChanges,
    createdAt: +endDate,
    updatedAt: +endDate,
  }]);
  console.timeEnd('Change insertion');
  console.timeEnd('Changes');

  return insertedItems;
}

function storeAllChanges() {
  return storeChanges().then((inserted) => !inserted  || storeAllChanges());
}

console.log('store start');
storeAllChanges().then(() => {
  console.log('stored');
  process.exit(0);
}).catch((a) => {
  console.error('errored!', a);
  process.exit(1)
});