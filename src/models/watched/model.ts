import { BaseModel } from '../baseModel';
import { User } from '../user/model';
import { Rating } from '../rating/model';
import { Review } from '../review/model';
import { Movie } from '../movie/model';
import { Tv } from '../tv/model';

import { Episode } from '../episode/model';
import { Season } from '../season/model';
import { ItemTypes, TvItemTypes } from '../../util/watchedItemHelper';

export class Watched extends BaseModel {
  readonly id: string;
  tmdbId: number;

  userId?: string;
  user?: User;

  itemType?: ItemTypes;
  itemId?: string;
  movie?: Movie;
  tv?: Tv;

  tvItemType?: TvItemTypes;
  tvItemId?: string;
  season?: Season;
  episode?: Episode;

  rating?: Partial<Rating>;
  review?: Partial<Review>;

  static tableName = 'Watched';

  static relationMappings = {
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../user/model',
      join: {
        from: 'Watched.userId',
        to: 'User.id',
      },
    },
    rating: {
      relation: BaseModel.HasOneRelation,
      modelClass: '../rating/model',
      join: {
        from: 'Watched.id',
        to: 'Rating.watchedId',
      },
    },
    review: {
      relation: BaseModel.HasOneRelation,
      modelClass: '../review/model',
      join: {
        from: 'Watched.id',
        to: 'Review.watchedId',
      },
    },
    movie: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../movie/model',
      join: {
        from: 'Watched.itemId',
        to: 'Movie.id',
      },
    },
    tv: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../tv/model',
      join: {
        from: 'Watched.itemId',
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
    required: ['itemId', 'userId'],

    properties: {
      id: { type: 'string' },
      itemId: { type: 'string' },
      userId: { type: 'string' },
    },
  };
}
