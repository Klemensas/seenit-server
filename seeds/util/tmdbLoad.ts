import tmdbService, { TMDB } from './services/TMDB';
import { tvIds } from '../seeds/util/tmdbIds';

async function loadList(list = tvIds, tmDb: TMDB = tmdbService) {
  let loadedItems = [];
  try {
    const result = await tmDb.get('tv/' + list.shift());
    loadedItems.push(result.data);

    const maxRequests = result.headers['x-ratelimit-limit'];
    let remainingRequests = result.headers['x-ratelimit-remaining'];
    // let nextBatch = result.headers['x-ratelimit-reset'];
    while (list.length) {
      const { items, headers } = await loadBatch(list, remainingRequests);
      loadedItems = loadedItems.concat(items);
      const nextBatch = headers['x-ratelimit-reset'];
      await new Promise((resolve) => setTimeout(() => { console.log('resolve', (+nextBatch - Date.now() / 1000) * 1000); resolve() }, (+nextBatch - Date.now() / 1000) * 1000));
      console.log('wait done', Date.now() / 1000, nextBatch);
      remainingRequests = maxRequests;
    }

    return loadedItems;
  } catch (err) {
    console.log('err', err);
    throw err;
  }

  async function loadBatch(list: any[], batchSize) {
    const batch = list.slice(0, batchSize);
    const batchResults = await Promise.all(batch.map((id) => tmDb.get('tv/' + id)));
    const headers = batchResults[batchResults.length - 1].headers;
    const items = batchResults.map(({ data }) => data);
    list.splice(0, batchSize)
    return { items, headers };
  }
}
