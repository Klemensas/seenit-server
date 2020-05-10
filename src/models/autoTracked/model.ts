import { BaseModel } from '../baseModel';
import { User } from '../user/model';
import { ItemTypes, TvItemTypes } from '../../util/watchedItemHelper';
import { Movie } from '../movie/model';
import { Tv } from '../tv/model';
import { Season } from '../season/model';
import { Episode } from '../episode/model';

type AutoTrackedMeta = {
  title?: string;
  filename?: string;
  url?: string;
  provider: string;
};

export class AutoTracked extends BaseModel {
  readonly id: string;

  userId?: string;
  user?: User;

  itemType?: ItemTypes;
  itemId?: string;
  item?: Movie | Tv;

  tvItemType?: TvItemTypes;
  tvItemId?: string;
  tvItem: Season | Episode;

  meta: AutoTrackedMeta;

  static tableName = 'AutoTracked';

  static relationMappings = {
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../user/model',
      join: {
        from: 'AutoTracked.userId',
        to: 'User.id',
      },
    },
    movie: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../movie/model',
      join: {
        from: 'AutoTracked.itemId',
        to: 'Movie.id',
      },
    },
    tv: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../tv/model',
      join: {
        from: 'AutoTracked.itemId',
        to: 'Tv.id',
      },
    },
    season: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../season/model',
      join: {
        from: 'AutoTracked.tvItemId',
        to: 'Season.id',
      },
    },
    episode: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: '../episode/model',
      join: {
        from: 'AutoTracked.tvItemId',
        to: 'Episode.id',
      },
    },
  };

  static jsonSchema = {
    type: 'object',
    required: ['userId'],

    properties: {
      userId: { type: 'string' },
    },
  };
}
