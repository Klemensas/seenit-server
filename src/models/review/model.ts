import { BaseModel } from '../baseModel';
import { User } from '../user/model';
import { Watched } from '../watched/model';
import { Tv } from '../tv/model';
import { Movie } from '../movie/model';
import { Season } from '../season/model';
import { Episode } from '../episode/model';
import { ItemTypes, TvItemTypes } from '../../util/watchedItemHelper';

export class Review extends BaseModel {
  readonly id: string;
  body: string;

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

  static tableName = 'Review';

  static relationMappings = {
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../user/model',
      join: {
        from: 'Review.id',
        to: 'User.id',
      },
    },
    movie: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../movie/model',
      join: {
        from: 'Review.itemId',
        to: 'Movie.id',
      },
    },
    tv: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../tv/model',
      join: {
        from: 'Review.itemId',
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
