import { BaseModel } from '../baseModel';
import { knex } from '../../config';
import { Watched } from '../watched/model';
import { Genre, Company } from '../movie/model';
import { Season } from '../season/model';
import { Episode } from '../episode/model';
import { ItemTypes } from '../../util/watchedItemHelper';

export interface Author {
  id: number;
  credit_id?: number;
  name?: string;
  gender?: number;
  profile_path?: string;
}

export interface Network {
  id: number;
  name?: string;
  logo_path?: string;
  origin_country?: string;
}

export class Tv extends BaseModel {
  readonly id: string;
  name?: string;
  overview?: string;
  first_air_date?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  vote_count?: number;
  created_by?: Author[];
  episode_run_time?: number[];
  genres?: Genre[];
  homepage?: string;
  in_production?: boolean;
  languages?: string[];
  last_air_date?: string;
  last_episode_to_air?: Episode;
  next_episode_to_air?: Episode;
  networks?: Network[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  origin_country?: string[];
  original_language?: string;
  original_name?: string;
  popularity?: number;
  production_companies?: Company[];
  status?: string;
  type?: string;
  titleVector?: string;

  tmdbId: number;

  watched?: Watched;
  seasons?: Season[];

  static tableName = 'Tv';

  static relationMappings = {
    watched: {
      relation: BaseModel.HasManyRelation,
      modelClass: '../watched/model',
      join: {
        from: 'Tv.id',
        to: 'Watched.itemId',
      },

      filter(builder) {
        builder.where('itemType', ItemTypes.Tv);
      },

      beforeInsert(model) {
        model.itemType = ItemTypes.Tv;
      },
    },
    seasons: {
      relation: BaseModel.HasManyRelation,
      modelClass: '../season/model',
      join: {
        from: 'Tv.id',
        to: 'Season.tvId',
      },
    },
  };

  static jsonSchema = {
    properties: {},
  };

  $formatDatabaseJson(json) {
    json = super.$formatDatabaseJson(json);

    if (json.name) {
      json.titleVector = knex.raw(`to_tsvector(?)`, json.name);
    }

    return json;
  }
}
