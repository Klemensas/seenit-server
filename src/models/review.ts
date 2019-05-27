import { BaseModel } from './baseModel';
import { User } from './user';
import { Watched, ItemTypes } from './watched';
import { gql } from 'apollo-server-express';

export class Review extends BaseModel {
  readonly id: number;
  body: string;
  tmdbId: number;

  userId?: number;
  user?: User;

  watchedId?: number;
  watched?: Watched;

  itemTypes: ItemTypes;
  itemId: number;

  static tableName = 'Review';

  static relationMappings = {
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'user',
      join: {
        from: 'Review.id',
        to: 'User.id',
      },
    },
  };

  static jsonSchema = {
    type: 'object',
    required: ['body', 'tmdbId', 'userId'],

    properties: {
      id: { type: 'integer' },
      body: { type: 'string' },
      // tmdbId: { type: 'integer' },
      userId: { type: 'integer' },
      watchedId: { type: 'integer' },
    },
  };
}

export const typeDefs = gql`
  type Review {
    id: ID!
    body: String!
    tmdbId: Int!
    userId: ID!
    user: User
    watched: Watched
  }

  input ReviewInput {
    body: String!
  }
`;
