import {
  cursorListResolver,
  WatchedItemListArgs,
} from '../../util/watchedItemHelper';
import { Review } from './model';
import { getPaginatedReviews } from './queries';
import { getWatchedById } from '../watched/queries';

const reviewResolver = cursorListResolver(getPaginatedReviews, 'reviews');

const resolvers = {
  Query: {
    // TODO: extract WatchedArgs and name to indicate reusage between watched/reviews/rating
    reviews: async (parent, { cursor, ...filters }: WatchedItemListArgs) =>
      reviewResolver(filters, cursor),
  },
  Review: {
    watched: (review: Review) => getWatchedById(review.watchedId),
  },
};

export default resolvers;
