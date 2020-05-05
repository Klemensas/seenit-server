import { BaseModel } from '../baseModel';
import { Season } from '../season/model';

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

  tmdbId: number;

  seasonId: string;
  season?: Season[];

  static tableName = 'Episode';

  // TODO: double check if these also need relationMapping for tvItemType
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
