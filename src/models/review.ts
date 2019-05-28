import { gql } from 'apollo-server-express';

import { BaseModel } from './baseModel';
import { User } from './user';
import { Watched, ItemTypes } from './watched';
import { TvData, Tv } from './tv';
import { Movie } from './movie';

export class Review extends BaseModel {
  readonly id: number;
  body: string;
  tmdbId: number;

  userId?: number;
  user?: User;

  watchedId?: number;
  watched?: Watched;

  itemType: ItemTypes;
  itemId: number;
  item?: Movie | Tv;
  tvData?: TvData;

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
    movie: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'movie',
      join: {
        from: 'Review.itemId',
        to: 'Movie.id',
      },
    },
    tv: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'tv',
      join: {
        from: 'Review.itemId',
        to: 'Tv.id',
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
    tvData: TvData
  }

  input ReviewInput {
    body: String!
  }
`;
