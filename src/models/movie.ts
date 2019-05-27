import { BaseModel } from './baseModel';
import { gql } from 'apollo-server';

import { Watched, ItemTypes } from './watched';

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

export type MovieStatus = 'Rumored'
| 'Planned'
| 'In Production'
| 'Post Production'
| 'Released'
| 'Canceled'
;

// tslint:disable: variable-name
export class Movie extends BaseModel {
  readonly id: string;
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
  title?: string;
  video?: boolean;
  vote_average?: number;
  vote_count?: number;

  // tslint:enable: variable-name
  tmdbId: number;

  watched?: Watched;

  static tableName = 'Movie';

  static relationMappings = {
    watched: {
      relation: BaseModel.HasManyRelation,
      modelClass: 'watched',
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
}

export const typeDefs = gql`
  type Movie {
    id: ID!
    adult: Boolean
    backdrop_path: String
    belongs_to_collection: Collection
    budget: Int
    genre: [Genre]
    homepage: String
    imdb_id: String
    original_language: String
    original_title: String
    overview: String
    popularity: Float
    poster_path: String
    production_companies: [Company]
    production_countries: [Country]
    release_date: String
    revenue: Int
    runtime: Int
    spoken_languages: [Language]
    status: String
    tagline: String
    title: String
    video: Boolean
    vote_average: Float
    vote_count: Int
    tmdbId: Int
  }

  type Genre {
    id: Int
    name: String
  }

  type Collection {
    id: Int
    name: String
    poster_path: String
    backdrop_path: String
  }

  type Company {
    id: Int
    name: String
    logo_path: String
    origin_country: String
  }

  type Country {
    iso_3166_1: String
    name: String
  }

  type Language {
    iso_639_1: String
    name: String
  }
`;
