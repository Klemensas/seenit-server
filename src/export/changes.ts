import { knex } from '../config';
import TMDB, { MediaType, TV, Movie as TmdbMovie, TmdbSeason, TmdbEpisode } from '../services/TMDB';
import { Movie } from '../models/movie';
import { Tv } from '../models/tv';
import { DailyExports } from './dailyExport';
import { DailyChanges } from '../models/dailyChanges';
import { Season } from '../models/season';
import { Episode } from '../models/episode';
import { logError } from '../errors/log';

const exportDate = '2019-08-30';

export enum ExportPaths {
  'movie' = '/movie/changes',
  'tv' = '/tv/changes',
}

export async function loadEpisodeData() {
  const items = await Tv.query(knex);

  const group = [];
  let target;
  let item;

  while (items.length) {
    target = items.shift();
    item = await DailyExports.fetchItemWithDeletion(target.tmdbId, 'tv')
    const { data, remainingLimit, nextBatch } = item;

    if (data) {
      const { id, ...newData } = data;
      group.push({ ...target, ...newData });
    }

    if (!remainingLimit) {
      await new Promise((resolve) => setTimeout(resolve, (nextBatch - Math.floor(Date.now() / 1000)) * 1000 + 1000));
    }
  }

  await Tv.query(knex).upsertGraph(group, { noDelete: true });
}

export async function getRangeChanges(type: MediaType, from: Date, to: Date = new Date(), batch: number) {
  const route = ExportPaths[type];
  const fromString = [from.getUTCFullYear(), String(from.getUTCMonth() + 1).padStart(2, '0'), String(from.getUTCDate()).padStart(2, '0')].join('-');
  const toString = [to.getUTCFullYear(), String(to.getUTCMonth() + 1).padStart(2, '0'), String(to.getUTCDate()).padStart(2, '0')].join('-');

  const changes = await getPage(route, fromString, toString);
  const changedIds = changes.filter(({ adult }) => !adult).map(({ id }) => id);
  console.log(`Starting loading for ${changedIds.length} ${type} items`)
  const query = type === 'movie' ? Movie.query() : Tv.query().eager('[seasons.episodes]');

  const [data, currentItems] = await Promise.all([
    loadItemsSync(changedIds, type) as any,
    query.whereIn('tmdbId', changedIds),
  ]);

  const newItems = await (type === 'movie' ? updateMovieItems(currentItems as Movie[], data) : updateTvItems(currentItems, data));
  console.log('yep update', data.items.length, data.deletedIds.length, newItems.length)

  await DailyChanges.query().insertGraph(data.deletedIds.map((tmdbId) => ({
    type,
    tmdbId,
    batch,
    changes: {
      old: currentItems.some(({ tmdbId: existingTmdbId }) => existingTmdbId === tmdbId),
      new: null,
    },
  })));

  console.log('final moment')
  await DailyChanges.query().insertGraph(newItems.map((item) => ({
    type,
    tmdbId: item.tmdbId,
    batch,
    changes: {
      old: currentItems.some(({ tmdbId: existingTmdbId }) => existingTmdbId === item.tmdbId),
      new: true,
    },
  })));
  console.log('rip in pieces')
}

async function updateMovieItems(items: Movie[], updates: { items: TmdbMovie[], deletedIds: number[] }, connection = knex) {
  const formattedItems = updates.items.map(({ id, ...item }) => ({
    ...items.find(({ tmdbId }) => tmdbId === id),
    ...item,
    tmdbId: id,
  }));

  await Promise.all([
    Movie.query(connection).upsertGraph(formattedItems, {
      noDelete: true,
    }),
    Movie.query(connection).whereIn('tmdbId', updates.deletedIds).del(),
  ]);

  return formattedItems;
}

async function updateTvItems(items: Tv[], updates: { items: TV[], deletedIds: number[] }, connection = knex) {
  const formattedItems = formatTvItems(items, updates.items);

  await Promise.all([
    Tv.query(connection).upsertGraph(formattedItems, {
      noDelete: true,
    }),
    Tv.query(connection).whereIn('tmdbId', updates.deletedIds).del(),
  ]);

  return formattedItems;
}

export function formatTvItems(items: Tv[], changes: TV[]) {
  return changes.map(({ id, ...item }) => {
    const storedItem = items.find(({ tmdbId }) => tmdbId === id);
    const newItem: any = {
      ...storedItem,
      ...item,
      tmdbId: id,
      seasons: formatTvSeasons(item.seasons, storedItem ? storedItem.seasons : []),
    };

    return newItem;
  });
}

export function formatTvSeasons(seasonData: TmdbSeason[], currentData: Season[]) {
  return seasonData.map(({ id: tmdbId, _id, episodes, air_date, ...season }: any) => {
    const storedSeason = currentData.find(({ tmdbId: existingTmdbId }) => existingTmdbId === tmdbId);

    return {
      ...storedSeason,
      tmdbId,
      air_date: +new Date(air_date) || null,
      episodes: episodes ? formatTvEpisodes(episodes, storedSeason ? storedSeason.episodes : []) : [],
      ...season,
    };
  });
}

export function formatTvEpisodes(episodeData: TmdbEpisode[], currentData: Episode[]) {
  return episodeData.map(({ id: tmdbId, air_date, show_id, season_number, ...episode }) => {
    const storedEpisode = currentData.find(({ tmdbId: existingTmdbId }) => existingTmdbId === tmdbId);

    return {
      ...storedEpisode,
      tmdbId,
      air_date: +new Date(air_date) || null,
      ...episode,
    };
  });
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

async function loadItemsSync(ids: number[], type: MediaType) {
  const list = [...ids];
  const deletedIds = [];
  const items = [];

  while (list.length) {
    const { data, id, remainingLimit, nextBatch } = await DailyExports.fetchItemWithDeletion(list.shift(), type);
    if (data) {
      items.push(data);
    } else {
      deletedIds.push(id);
    }

    if (!remainingLimit) {
      await new Promise((resolve) => setTimeout(resolve, (nextBatch - Math.floor(Date.now() / 1000)) * 1000 + 1000));
    }
  }

  return { items, deletedIds };
}

export async function storeChanges() {
  const lastChanges = await DailyChanges.query(knex).orderBy('createdAt', 'desc').limit(1).first();

  const lastDate = lastChanges ? +lastChanges.createdAt : exportDate;
  const batch = lastChanges ? lastChanges.batch + 1 : 0;
  const date = new Date(lastDate);
  const daysFromLastCheck = (Date.now() - +date) / 86400000;
  const endTime = daysFromLastCheck > 2 ? +date +  172800000 : Date.now()
  const endDate = new Date(endTime);

  if (date.getDate() === endDate.getDate() && date.getMonth() === endDate.getMonth() && date.getFullYear() === endDate.getFullYear()) {
    console.log(`You're all good with todays changes`);
    return null;
  }

  console.time('Changes');
  await getRangeChanges('movie', date, endDate, batch);
  await getRangeChanges('tv', date, endDate, batch);
  console.timeEnd('Changes');

  return true;
}

function storeAllChanges() {
  return storeChanges().then((inserted) => !inserted  || storeAllChanges());
}

console.log('store start');
storeAllChanges().then(() => {
  console.log('stored');
  process.exit(0);
}).catch((err) => {
  console.log('uh oh')
  logError(`Changes bailed - ${err.toString()}`, () => {
    process.exit(1);
  })
});
