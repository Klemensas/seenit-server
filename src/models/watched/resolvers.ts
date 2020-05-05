import { getTvById } from '../tv/queries';
import {
  TvItemTypes,
  ItemTypes,
  cursorListResolver,
  WatchedItemListArgs,
} from '../../util/watchedItemHelper';
import { Rating } from '../rating/model';
import { Review } from '../review/model';
import { getMovieById } from '../movie/queries';
import {
  getPaginatedWatched,
  getWatchedById,
  createWatchedGraph,
  upsertWatchedGraph,
  deleteWatchedById,
} from './queries';
import { isAuthenticated } from '../../apollo/helperResolvers';
import { User } from '../user/model';
import { getSeasonById } from '../season/queries';
import { getEpisodeById } from '../episode/queries';
import { getUserById } from '../user/queries';
import { getReviewByWatched } from '../review/queries';
import { getRatingByWatched } from '../rating/queries';

interface AddWatchedPayload {
  itemId: string;
  itemType: ItemTypes;
  createdAt: number;
  rating?: Pick<Rating, 'value'>;
  review?: Pick<Review, 'body'>;
  tvItemId?: string;
  tvItemType?: TvItemTypes;
}

const itemLoaders = {
  [ItemTypes.Tv]: getTvById,
  [ItemTypes.Movie]: getMovieById,
};

export const watchedResolver = cursorListResolver(getPaginatedWatched);

interface EditWatched {
  id: string;
  createdAt: number;
  review?: Pick<Review, 'body'> & { id?: string };
  rating?: Pick<Rating, 'value'> & { id?: string };
  tvItemId?: string;
  tvItemType?: TvItemTypes;
}

export const resolvers = {
  Query: {
    watches: (parent, { cursor, ...filters }: WatchedItemListArgs) =>
      watchedResolver(filters, cursor),
    watched: (parent, { id }) => getWatchedById(id),
  },
  Mutation: {
    addWatched: isAuthenticated.createResolver(
      async (
        parent,
        {
          itemId,
          itemType,
          rating,
          review,
          createdAt,
          tvItemId,
          tvItemType,
        }: AddWatchedPayload,
        { user }: { user: User },
      ) => {
        const { tmdbId } = await itemLoaders[itemType](itemId);
        const itemData = {
          itemId,
          itemType: itemType,
          tmdbId,
          tvItemId,
          tvItemType,
        };
        const userId = user.id;
        const ratingItem = rating
          ? {
              ...rating,
              ...itemData,
              userId,
            }
          : null;
        const reviewItem = review
          ? {
              ...review,
              ...itemData,
              userId,
            }
          : null;
        return createWatchedGraph({
          ...itemData,
          userId,
          rating: ratingItem,
          review: reviewItem,
          createdAt,
        });
      },
    ),
    editWatched: isAuthenticated.createResolver(
      async (
        parent,
        { id, createdAt, review, rating, tvItemId, tvItemType }: EditWatched,
        { user }: { user: User },
      ) => {
        const originalWatched = await getWatchedById(id).withGraphFetched(
          '[review, rating]',
        );
        const isOwner = originalWatched.userId === user.id;

        if (!isOwner) throw 'uh oh';

        return upsertWatchedGraph({
          id,
          createdAt,
          tvItemId,
          tvItemType,
          review: review
            ? {
                itemId: originalWatched.itemId,
                userId: originalWatched.userId,
                ...review,
              }
            : null,
          rating: rating
            ? {
                itemId: originalWatched.itemId,
                userId: originalWatched.userId,
                ...rating,
              }
            : null,
        });
      },
    ),
    removeWatched: isAuthenticated.createResolver(
      async (
        parent,
        { itemId }: { itemId: string },
        { user }: { user: User },
      ) => {
        const watched = await getWatchedById(itemId);
        const isOwner = watched.userId === user.id;

        if (!isOwner) throw 'uh oh';

        await deleteWatchedById(watched.id);
        return watched.id;
      },
    ),
  },
  Item: {
    __resolveType(obj) {
      return obj.constructor.name;
    },
  },
  TvItem: {
    __resolveType(obj) {
      return obj.constructor.name;
    },
  },
  Watched: {
    item: (watched) =>
      watched.itemType === ItemTypes.Movie
        ? getMovieById(watched.itemId)
        : getTvById(watched.itemId),
    tvItem: (watched) => {
      if (!watched.tvItemType) return null;

      return watched.tvItemType === TvItemTypes.Season
        ? getSeasonById(watched.tvItemId)
        : getEpisodeById(watched.tvItemId);
    },
    user: (watched) => getUserById(watched.userId),
    rating: (watched) => getRatingByWatched(watched.id),
    review: (watched) => getReviewByWatched(watched.id),
  },
};
