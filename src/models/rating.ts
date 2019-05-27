import { BaseModel } from './baseModel';
import { User } from './user';
import { Watched, ItemTypes } from './watched';
import { gql } from 'apollo-server';
import { Movie } from './movie';
import { Tv } from './tv';

// TODO: validation and better definitino for max val
export const maxRatingValue = 5;

export class Rating extends BaseModel {
  readonly id: number;
  value: number;
  symbol: string;
  tmdbId: number;
  item?: Movie | Tv;

  userId?: number;
  user?: User;

  watchedId?: number;
  watched?: Watched;

  itemTypes: ItemTypes;
  itemId: number;

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
    item: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'user',
      join: {
        from: 'Rating.id',
        to: 'User.id',
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
  }

  input RatingInput {
    value: Float!
  }
`;