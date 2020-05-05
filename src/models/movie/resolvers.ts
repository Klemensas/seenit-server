import { getMovieById } from './queries';
import { getWatchedWithReviews, getPaginatedWatched } from '../watched/queries';

export const resolvers = {
  Query: {
    movie: (parent, { id }) => getMovieById(id),
  },
  Movie: {
    watched: async (movie, { cursor, filter }) => {
      const count = 12;
      const query = filter ? getWatchedWithReviews : getPaginatedWatched;
      cursor = cursor || Date.now();

      const { total, results } = await query(
        { itemId: movie.id },
        { count, after: cursor },
      );

      const lastItem = results[results.length - 1];
      const newCursor = lastItem?.createdAt;
      const hasMore = total > count;

      return { watched: results, hasMore, cursor: newCursor, filter };
    },
  },
};
