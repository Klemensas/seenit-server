import {
  cursorListResolver,
  WatchedItemListArgs,
} from '../../util/watchedItemHelper';

import { getPaginatedReviews } from '../../queries/reviewQueries';
import { getWatchedById } from '../../queries/watchedQueries';
import { Review } from '../review';

const reviewResolver = cursorListResolver(getPaginatedReviews, 'reviews');

const resolvers = {
  Query: {
    // TODO: extract WatchedArgs and name to indicate reusage between watched/reviews/rating
    reviews: async (parent, { cursor, ...filters }: WatchedItemListArgs) => {
      const reviews = await reviewResolver(filters, cursor);
      return reviews;
    },
  },
  Review: {
    watched: (review: Review) => getWatchedById(review.watchedId),
  },
};

export default resolvers;
