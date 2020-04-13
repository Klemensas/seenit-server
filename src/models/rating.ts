import { gql } from 'apollo-server-express';

import { BaseModel } from './baseModel';
import { User } from './user';
import { Watched, ItemTypes } from './watched';
import { Movie } from './movie';
import { Tv, TvData } from './tv';
import { Season } from './season';
import { Episode } from './episode';

// TODO: validation and better definitino for max val
export const maxRatingValue = 5;

export class Rating extends BaseModel {
  readonly id: string;
  value: number;
  symbol: string;

  userId?: string;
  user?: User;

  watchedId?: string;
  watched?: Watched;

  itemType: ItemTypes;
  itemId: string;
  item?: Movie | Tv | Season | Episode;

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
    required: ['value', 'itemId', 'userId'],

    properties: {
      id: { type: 'string' },
      value: { type: 'float' },
      tmdbId: { type: 'integer' },
      itemId: { type: 'string' },
      userId: { type: 'string' },
      watchedId: { type: 'string' },
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
    id: ID
    value: Float!
  }
`;
