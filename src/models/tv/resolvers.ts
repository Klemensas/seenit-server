import { UserInputError } from 'apollo-server-express';
import { performance } from 'perf_hooks';

import { Tv } from './model';
import { getTvById } from './queries';
import { perPage } from '../../config/constants';
import { getSeasonsByTvId } from '../season/queries';
import { getWatchedWithReviews, getPaginatedWatched } from '../watched/queries';

export const resolvers = {
  Query: {
    tv: async (parent, { id }) => {
      try {
        const tv = await getTvById(id);

        return tv;
      } catch (err) {
        throw new UserInputError(err.message);
      }
    },
  },
  Tv: {
    seasons: async (tv: Tv) => {
      const t0 = performance.now();
      const seasons = await getSeasonsByTvId(tv.id);
      const t1 = performance.now();
      console.log('Seasons took ' + (t1 - t0) + ' milliseconds.');

      return seasons;
    },

    watched: async (tv, { cursor, filter }) => {
      const count = perPage;
      const query = filter ? getWatchedWithReviews : getPaginatedWatched;
      cursor = cursor || Date.now();

      const { total, results } = await query(
        { itemId: tv.id },
        { count, after: cursor },
      );

      const lastItem = results[results.length - 1] as any;
      const newCursor = lastItem ? lastItem.createdAt : undefined;
      const hasMore = total > count;

      return { watched: results, hasMore, cursor: newCursor, filter };
    },
  },
};
