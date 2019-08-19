import { BaseModel } from './baseModel';
import { Tv } from './tv';
import { Episode } from './episode';

// tslint:disable: variable-name
export class Season extends BaseModel {
  readonly id: string;
  name?: string;
  overview?: string;
  air_date?: string;
  episode_count?: number;
  poster_path?: string;
  season_number?: number;

  // tslint:enable: variable-name
  tmdbId: number;

  tvId: number;
  tv?: Tv;
  episodes: Episode[];

  static tableName = 'Season';

  static relationMappings = {
    tv: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'tv',
      join: {
        from: 'Tv.id',
        to: 'Season.tvId',
      },
    },
    episodes: {
      relation: BaseModel.HasManyRelation,
      modelClass: 'episode',
      join: {
        from: 'Season.id',
        to: 'Episode.seasonId',
      },
    },
  };

  static jsonSchema = {
    properties: {},
  };
}
