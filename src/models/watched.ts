import { gql } from 'apollo-server-express';

import { BaseModel } from './baseModel';
import { User } from './user';
import { Rating } from './rating';
import { Review } from './review';
import { getWatched, getWatchedById, createWatchedGraph } from '../queries/watchedQueries';
import { getUserById } from '../queries/userQueries';
import { isAuthenticated } from '../apollo/resolvers';
import { getRatingByWatched } from '../queries/ratingQueries';
import { getReviewByWatched } from '../queries/reviewQueries';
import { Movie } from './movie';
import { Tv, TvData } from './tv';
import { getMovieById, getMovieByTmdbId } from '../queries/movieQueries';
import { getTvById, getTvByTmdbId } from '../queries/tvQueries';

export const enum ItemTypes {
  'Movie' = 'Movie',
  'Tv' = 'Tv',
}

export class Watched extends BaseModel {
  readonly id: number;
  tmdbId: number;

  userId?: number;
  user?: User;

  itemType: ItemTypes;
  itemId: number;
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
    required: ['tmdbId', 'userId'],

    properties: {
      id: { type: 'integer' },
      // tmdbId: { type: 'integer' },
      userId: { type: 'integer' },
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
    user: User
    itemType: ItemType!
    item: Item
    rating: Rating
    review: Review
    tvData: TvData
  }

  extend type Query {
    allWatched: [Watched!]
    watched(id: ID!): Watched
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

export const resolvers = {
  Query: {
    allWatched: (parent, args, { models }) => getWatched({}),
    watched: (parent, { id }, { models }) => getWatchedById(id),
  },
  Mutation: {
    addWatched: isAuthenticated.createResolver(async (parent, { itemId, mediaType, tvData, rating, review, createdAt }, { user }) => {
      const userId = user.id;
      rating = rating ? {
        ...rating,
        userId,
      } : null;

      review = review ? {
        ...review,
        userId,
      } : null;

      return createWatchedGraph({
        userId,
        tvData,
        rating,
        review,
        createdAt,
        itemType: mediaType.slice(0, 1).toUpperCase() + mediaType.slice(1),
      });
    }),
  },
  Item: {
    __resolveType(obj, context, info) {
      return obj.constructor.name;
    },
  },
  Watched: {
    item: (watched, args, { loaders }) => watched.itemType === ItemTypes.Movie ? getMovieById(watched.itemId) : getTvById(watched.itemId),
    user: (watched, args, { loaders }) => getUserById(watched.userId),
    rating: (watched, args, { loaders }) => getRatingByWatched(watched.id),
    review: (watched, args, { loaders }) => getReviewByWatched(watched.id),
  },
};
