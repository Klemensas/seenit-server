import { gql } from 'apollo-server-express';

import { BaseModel } from './baseModel';
import { User } from './user';
import { Rating } from './rating';
import { Review } from './review';
import { Movie } from './movie';
import { Tv, TvData } from './tv';

import {
  getWatched,
  getWatchedById,
  createWatchedGraph,
  deleteWatchedById,
  upsertWatchedGraph,
} from '../queries/watchedQueries';
import { getUserById } from '../queries/userQueries';
import { getMovieById } from '../queries/movieQueries';
import { getRatingByWatched } from '../queries/ratingQueries';
import { getReviewByWatched } from '../queries/reviewQueries';
import { getTvById } from '../queries/tvQueries';

import { omitFalsy } from '../util/helpers';
import { isAuthenticated } from '../apollo/helperResolvers';

export const enum ItemTypes {
  'Movie' = 'Movie',
  'Tv' = 'Tv',
  'Season' = 'Season',
  'Episode' = 'Episode',
}

export class Watched extends BaseModel {
  readonly id: string;
  tmdbId: number;

  userId?: string;
  user?: User;

  itemType: ItemTypes;
  itemId: string;
  item?: Movie | Tv;
  tvData?: TvData;

  rating?: Partial<Rating>;
  review?: Partial<Review>;

  static tableName = 'Watched';

  static relationMappings = {
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'user',
      join: {
        from: 'Watched.id',
        to: 'User.id',
      },
    },
    rating: {
      relation: BaseModel.HasOneRelation,
      modelClass: 'rating',
      join: {
        from: 'Watched.id',
        to: 'Rating.watchedId',
      },
    },
    review: {
      relation: BaseModel.HasOneRelation,
      modelClass: 'review',
      join: {
        from: 'Watched.id',
        to: 'Review.watchedId',
      },
    },
    movie: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'movie',
      join: {
        from: 'Watched.itemId',
        to: 'Movie.id',
      },
    },
    tv: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'tv',
      join: {
        from: 'Watched.itemId',
        to: 'Tv.id',
      },
    },
  };

  static jsonSchema = {
    type: 'object',
    required: ['itemId', 'userId'],

    properties: {
      id: { type: 'string' },
      itemId: { type: 'string' },
      userId: { type: 'string' },
    },
  };
}

export const typeDefs = gql`
  enum ItemType {
    Movie
    Tv
  }

  union Item = Movie | Tv

  type Watched {
    id: ID!
    tmdbId: Int!
    createdAt: Float!
    updatedAt: Float!
    userId: ID!
    user: User!
    itemType: ItemType!
    item: Item!
    rating: Rating
    review: Review
    tvData: TvData
  }

  type WatchedCursor {
    watched: [Watched!]!
    cursor: String
    hasMore: Boolean!
  }

  extend type Query {
    watches(
      userId: ID
      itemId: ID
      itemType: ItemType
      cursor: String
    ): WatchedCursor!
    watched(id: ID!): Watched!
  }

  extend type Mutation {
    addWatched(
      itemId: ID!
      mediaType: TmdbMediaType!
      rating: RatingInput
      review: ReviewInput
      tvData: TvDataInput
      createdAt: Float
    ): Watched!
    editWatched(
      id: ID!
      createdAt: Float
      rating: RatingInput
      review: ReviewInput
    ): Watched!
    removeWatched(itemId: ID!): ID!
  }
`;

interface AddWatchedPayload {
  itemId: string;
  mediaType: ItemTypes;
  createdAt: number;
  rating?: Pick<Rating, 'value'>;
  review?: Pick<Review, 'body'>;
  tvData?: TvData;
}

const itemLoaders = {
  [ItemTypes.Tv]: getTvById,
  [ItemTypes.Movie]: getMovieById,
};

interface WatchesFilters {
  userId?: string;
  itemId?: string;
  itemType?: ItemTypes;
}

interface WatchedArgs extends WatchesFilters {
  cursor?: string;
}

export const watchedResolver = async (
  filters: WatchesFilters,
  cursor: string | number = Date.now(),
) => {
  const count = 12;

  const { total, results } = await getWatched(omitFalsy(filters), {
    count,
    after: cursor,
  });

  const lastItem = results[results.length - 1] as any;
  const newCursor = lastItem ? lastItem.createdAt : undefined;
  const hasMore = total > count;

  return { watched: results, hasMore, cursor: newCursor };
};

interface EditWatched {
  id: string;
  createdAt: number;
  review?: Pick<Review, 'body'> & { id?: string };
  rating?: Pick<Rating, 'value'> & { id?: string };
}

export const resolvers = {
  Query: {
    watches: (parent, { cursor, ...filters }: WatchedArgs) =>
      watchedResolver(filters, cursor),
    watched: (parent, { id }) => getWatchedById(id),
  },
  Mutation: {
    addWatched: isAuthenticated.createResolver(
      async (
        parent,
        {
          itemId,
          mediaType,
          tvData,
          rating,
          review,
          createdAt,
        }: AddWatchedPayload,
        { user }: { user: User },
      ) => {
        const { tmdbId } = await itemLoaders[mediaType](itemId);
        const itemData = {
          itemId,
          itemType: mediaType,
          tmdbId,
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
          tvData,
          rating: ratingItem,
          review: reviewItem,
          createdAt,
        });
      },
    ),
    editWatched: isAuthenticated.createResolver(
      async (
        parent,
        { id, createdAt, review, rating }: EditWatched,
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
  Watched: {
    item: (watched) =>
      watched.itemType === ItemTypes.Movie
        ? getMovieById(watched.itemId)
        : getTvById(watched.itemId),
    user: (watched) => getUserById(watched.userId),
    rating: (watched) => getRatingByWatched(watched.id),
    review: (watched) => getReviewByWatched(watched.id),
  },
};
