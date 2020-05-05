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

  itemType: ItemTypes;
  itemId: string;
  item?: Movie | Tv;

  tvItemType?: TvItemTypes;
  tvItemId?: string;
  tvItem?: Season | Episode;

  rating?: Partial<Rating>;
  review?: Partial<Review>;

  static tableName = 'Watched';

  static relationMappings = {
    user: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'user',
      join: {
        from: 'Watched.id',
        to: 'User.id',
      },
    },
    rating: {
      relation: BaseModel.HasOneRelation,
      modelClass: 'rating',
      join: {
        from: 'Watched.id',
        to: 'Rating.watchedId',
      },
    },
    review: {
      relation: BaseModel.HasOneRelation,
      modelClass: 'review',
      join: {
        from: 'Watched.id',
        to: 'Review.watchedId',
      },
    },
    movie: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'movie',
      join: {
        from: 'Watched.itemId',
        to: 'Movie.id',
      },
    },
    tv: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'tv',
      join: {
        from: 'Watched.itemId',
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
    required: ['itemId', 'userId'],

    properties: {
      id: { type: 'string' },
      itemId: { type: 'string' },
      userId: { type: 'string' },
    },
  };
}
