import { BaseModel } from '../baseModel';
import { User } from '../user/model';
import { Watched } from '../watched/model';
import { Movie } from '../movie/model';
import { Tv } from '../tv/model';
import { Season } from '../season/model';
import { Episode } from '../episode/model';
import { ItemTypes, TvItemTypes } from '../../util/watchedItemHelper';

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

  itemType?: ItemTypes;
  itemId?: string;
  movie?: Movie;
  tv?: Tv;

  tvItemType?: TvItemTypes;
  tvItemId?: string;
  season?: Season;
  episode?: Episode;

  static tableName = 'Rating';

  static relationMappings = {
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../user/model',
      join: {
        from: 'Rating.id',
        to: 'User.id',
      },
    },
    movie: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../movie/model',
      join: {
        from: 'Rating.itemId',
        to: 'Movie.id',
      },
    },
    tv: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../tv/model',
      join: {
        from: 'Rating.itemId',
        to: 'Tv.id',
      },
    },
    season: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../season/model',
      join: {
        from: 'Watched.tvItemId',
        to: 'Season.id',
      },
    },
    episode: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../episode/model',
      join: {
        from: 'Watched.tvItemId',
        to: 'Episode.id',
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
