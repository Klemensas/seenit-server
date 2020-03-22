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
} from '../queries/watchedQueries';
import { getUserById } from '../queries/userQueries';
import { getMovieById } from '../queries/movieQueries';
import { getRatingByWatched } from '../queries/ratingQueries';
import { getReviewByWatched } from '../queries/reviewQueries';
import { getTvById } from '../queries/tvQueries';

import { isAuthenticated } from '../apollo/resolvers';

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

  enum WatchedFilter {
    Reviewed
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
    filter: WatchedFilter
    hasMore: Boolean!
  }

  extend type Query {
    allWatched: [Watched!]
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
}

export const resolvers = {
  Query: {
    allWatched: (parent, args, { models }) => getWatched({}),
    watched: (parent, { id }, { models }) => getWatchedById(id),
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
  },
  Item: {
    __resolveType(obj, context, info) {
      return obj.constructor.name;
    },
  },
  Watched: {
    item: (watched, args, { loaders }) =>
      watched.itemType === ItemTypes.Movie
        ? getMovieById(watched.itemId)
        : getTvById(watched.itemId),
    user: (watched, args, { loaders }) => getUserById(watched.userId),
    rating: (watched, args, { loaders }) => getRatingByWatched(watched.id),
    review: (watched, args, { loaders }) => getReviewByWatched(watched.id),
  },
};
