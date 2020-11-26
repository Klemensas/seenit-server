import { knex } from '../../config';
import { BaseModel } from '../baseModel';
import { Watched } from '../watched/model';
import { ItemTypes } from '../../util/watchedItemHelper';

export interface Genre {
  id: number;
  name?: string;
}

export interface Collection {
  id: number;
  name?: string;
  poster_path?: string;
  backdrop_path?: string;
}

export interface Company {
  id: number;
  name?: string;
  logo_path?: string;
  origin_country: string;
}

export interface Country {
  iso_3166_1: string;
  name?: string;
}

export interface Language {
  iso_639_1: string;
  name?: string;
}

export type MovieStatus =
  | 'Rumored'
  | 'Planned'
  | 'In Production'
  | 'Post Production'
  | 'Released'
  | 'Canceled';

export class Movie extends BaseModel {
  readonly id: string;
  title?: string;
  adult?: boolean;
  backdrop_path?: string;
  belongs_to_collection?: Collection;
  budget?: number;
  genre?: Genre[];
  homepage?: string;
  imdb_id?: string;
  original_language?: string;
  original_title?: string;
  overview?: string;
  popularity?: number;
  poster_path?: string;
  production_companies?: Company[];
  production_countries?: Country[];
  release_date?: string;
  revenue?: number;
  runtime?: number;
  spoken_languages?: Language[];
  status?: MovieStatus;
  tagline?: string;
  video?: boolean;
  vote_average?: number;
  vote_count?: number;
  titleVector?: string;

  tmdbId: number;

  watched?: Watched;

  static tableName = 'Movie';

  static relationMappings = {
    watched: {
      relation: BaseModel.HasManyRelation,
      modelClass: '../watched/model',
      join: {
        from: 'Movie.id',
        to: 'Watched.itemId',
      },

      filter(builder) {
        builder.where('itemType', ItemTypes.Movie);
      },

      beforeInsert(model) {
        model.itemType = ItemTypes.Movie;
      },
    },
  };

  static jsonSchema = {
    properties: {},
  };

  $formatDatabaseJson(json) {
    json = super.$formatDatabaseJson(json);

    if (json.title) {
      json.titleVector = knex.raw(
        `to_tsvector('english_nostop', ?)`,
        json.title,
      );
    }

    return json;
  }
}
