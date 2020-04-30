import { gql } from 'apollo-server-express';

import { BaseModel } from './baseModel';
import { User } from './user';
import { Watched, ItemTypes, TvItemTypes } from './watched';
import { Tv } from './tv';
import { Movie } from './movie';
import { Season } from './season';
import { Episode } from './episode';

export class Review extends BaseModel {
  readonly id: string;
  body: string;

  userId?: string;
  user?: User;

  watchedId?: string;
  watched?: Watched;

  itemType: ItemTypes;
  itemId: string;
  item?: Movie | Tv;

  tvItemType?: TvItemTypes;
  tvItemId?: string;
  tvItem?: Season | Episode;

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
    season: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'season',
      join: {
        from: 'Watched.tvItemId',
        to: 'Season.id',
      },
    },
    episode: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'episode',
      join: {
        from: 'Watched.tvItemId',
        to: 'Episode.id',
      },
    },
  };

  static jsonSchema = {
    type: 'object',
    required: ['body', 'itemId', 'userId'],

    properties: {
      id: { type: 'string' },
      body: { type: 'string' },
      tmdbId: { type: 'integer' },
      itemId: { type: 'string' },
      userId: { type: 'string' },
      watchedId: { type: 'string' },
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
    tvItemType: TvItemType
    tvItemId: ID
    tvItem: TvItem
  }

  input ReviewInput {
    id: ID
    body: String!
  }
`;
