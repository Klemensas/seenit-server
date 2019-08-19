import { gql, UserInputError } from 'apollo-server-express';

import { BaseModel } from './baseModel';
import { Watched, ItemTypes } from './watched';
import { Genre, Company } from './movie';
import { getTvByTmdbId, createTv } from '../queries/tvQueries';
import tmdbService from '../services/TMDB';

export interface TvData {
  episode: number;
  season: number;
}

export interface Author {
  id: number;
  credit_id?: number;
  name?: string;
  gender?: number;
  profile_path?: string;
}

export interface Episode {
  id: number;
  air_date?: string;
  episode_number?: number;
  name?: string;
  overview?: string;
  production_code?: string;
  season_number?: number;
  show_id?: number;
  still_path?: string;
  vote_average?: number;
  vote_count?: number;
}

export interface Network {
  id: number;
  name?: string;
  logo_path?: string;
  origin_country?: string;
}

export interface Season {
  id: number;
  name?: string;
  overview?: string;
  air_date?: string;
  episode_count?: number;
  poster_path?: string;
  season_number?: number;
}

// tslint:disable: variable-name
export class Tv extends BaseModel {
  readonly id: string;
  backdrop_path?: string;
  created_by?: Author[];
  episode_run_time?: number[];
  first_air_date?: string;
  genres?: Genre[];
  homepage?: string;
  in_production?: boolean;
  languages?: string[];
  last_air_date?: string;
  last_episode_to_air?: Episode;
  name?: string;
  next_episode_to_air?: Episode;
  networks?: Network[];
  number_of_episodes?: number;
  number_of_seasons?: number;
  origin_country?: string[];
  original_language?: string;
  original_name?: string;
  overview?: string;
  popularity?: number;
  poster_path?: string;
  production_companies?: Company[];
  seasons?: Season[];
  status?: string;
  type?: string;
  vote_average?: number;
  vote_count?: number;

  // tslint:enable: variable-name
  tmdbId: number;

  watched?: Watched;

  static tableName = 'Tv';

  static relationMappings = {
    watched: {
      relation: BaseModel.HasManyRelation,
      modelClass: 'watched',
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
  };

  static jsonSchema = {
    properties: {},
  };
}

export const typeDefs = gql`
  type Tv {
    id: ID!
    backdrop_path: String
    created_by: [Author]
    episode_run_time: [Int]
    first_air_date: String
    genres: [Genre]
    homepage: String
    in_production: Boolean
    languages: [String]
    last_air_date: String
    last_episode_to_air: Episode
    name: String
    next_episode_to_air: Episode
    networks: [Network]
    number_of_episodes: Int
    number_of_seasons: Int
    origin_country: [String]
    original_language: String
    original_name: String
    overview: String
    popularity: Int
    poster_path: String
    production_companies: [Company]
    seasons: [Season]
    status: String
    type: String
    vote_average: Float
    vote_count: Int
    tmdbId: Int
  }

  type Author {
    id: Int
    credit_id: Int
    name: String
    gender: Int
    profile_path: String
  }

  type Episode {
    id: Int
    air_date: String
    episode_number: Int
    name: String
    overview: String
    production_code: String
    season_number: Int
    show_id: Int
    still_path: String
    vote_average: Float
    vote_count: Int
  }

  type Network {
    id: Int
    name: String
    logo_path: String
    origin_country: String
  }

  type Season {
    id: Int
    name: String
    overview: String
    air_date: String
    episode_count: Int
    poster_path: String
    season_number: Int
  }

  type TvData {
    season: Int
    episode: Int
  }

  input TvDataInput {
    episode: Int
    season: Int
  }

  extend type Query {
    tv(tmdbId: Int): Tv
  }
`;

export const resolvers = {
  Query: {
    tv: async (parent, { tmdbId }, { models }) => {
      try {
        const tv = await getTvByTmdbId(tmdbId);

        if (tv) { return tv; }

        const response = await tmdbService.get(`tv/${tmdbId}`);
        const { id, ...tmdbTv} = response.data;
        return createTv({
          ...tmdbTv,
          tmdbId: id,
        });
      } catch (err) {
        throw new UserInputError(err.message);
      }
    },
  },
};
