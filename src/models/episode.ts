import { BaseModel } from './baseModel';
import { Tv } from './tv';
import { Season } from './season';

// tslint:disable: variable-name
export class Episode extends BaseModel {
  readonly id: string;
  name?: string;
  overview?: string;
  episode_number?: number;
  air_date?: number | string;
  production_code?: string;
  still_path?: string;
  vote_average?: number;
  vote_count?: number;
  // not really used but added for consistency with api
  crew: any[];
  guest_stars: any[];

  // tslint:enable: variable-name
  tmdbId: number;

  seasonId: string;
  season?: Season[];

  static tableName = 'Episode';

  static relationMappings = {
    season: {
      relation: BaseModel.BelongsToOneRelation,
      modelClass: 'season',
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
