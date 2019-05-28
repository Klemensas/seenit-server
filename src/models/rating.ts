import { gql } from 'apollo-server-express';

import { BaseModel } from './baseModel';
import { User } from './user';
import { Watched, ItemTypes } from './watched';
import { Movie } from './movie';
import { Tv, TvData } from './tv';

// TODO: validation and better definitino for max val
export const maxRatingValue = 5;

export class Rating extends BaseModel {
  readonly id: number;
  value: number;
  symbol: string;
  tmdbId: number;

  userId?: number;
  user?: User;

  watchedId?: number;
  watched?: Watched;

  itemType: ItemTypes;
  itemId: number;
  item?: Movie | Tv;
  tvData?: TvData;

  static tableName = 'Rating';

  static relationMappings = {
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'user',
      join: {
        from: 'Rating.id',
        to: 'User.id',
      },
    },
    movie: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'movie',
      join: {
        from: 'Rating.itemId',
        to: 'Movie.id',
      },
    },
    tv: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'tv',
      join: {
        from: 'Rating.itemId',
        to: 'Tv.id',
      },
    },
  };

  static jsonSchema = {
    type: 'object',
    required: ['value', 'tmdbId', 'userId'],

    properties: {
      id: { type: 'integer' },
      value: { type: 'float' },
      // tmdbId: { type: 'integer' },
      userId: { type: 'integer' },
      watchedId: { type: 'integer' },
    },
  };
}

export const typeDefs = gql`
  type Rating {
    id: ID!
    value: Float!
    tmdbId: Int!
    userId: ID!
    createdAt: Float!
    updatedAt: Float!
    user: User
    watched: Watched
    tvData: TvData
  }

  input RatingInput {
    value: Float!
  }
`;
