import { gql, UserInputError } from 'apollo-server-express';

import { knex } from '../config';
import { BaseModel } from './baseModel';
import { Watched, ItemTypes } from './watched';
import { Genre, Company } from './movie';
import { getTvById } from '../queries/tvQueries';
import { Season } from './season';
import { Episode } from './episode';
import { getSeasonsByTvId } from '../queries/seasonQueries';
import { performance } from 'perf_hooks';

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

export interface Network {
  id: number;
  name?: string;
  logo_path?: string;
  origin_country?: string;
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
  status?: string;
  type?: string;
  vote_average?: number;
  vote_count?: number;
  titleVector?: string;

  // tslint:enable: variable-name
  tmdbId: number;

  watched?: Watched;
  seasons?: Season[];

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
    seasons: {
      relation: BaseModel.HasManyRelation,
      modelClass: 'season',
      join: {
        from: 'Tv.id',
        to: 'Season.tvId',
      },
    },
  };

  static jsonSchema = {
    properties: {},
  };

  async $formatDatabaseJson(json) {
    json = super.$formatDatabaseJson(json);

    if (json.name) {
      json.titleVector = knex.raw(`to_tsvector(?)`, json.name);
    }

    return json;
  }
}

export const typeDefs = gql`
  type Tv {
    id: ID!
    backdrop_path: String!
    created_by: [Author]
    episode_run_time: [Int]
    first_air_date: String!
    genres: [Genre]
    homepage: String
    in_production: Boolean
    languages: [String]
    last_air_date: String
    last_episode_to_air: Episode
    name: String!
    next_episode_to_air: Episode
    networks: [Network]
    number_of_episodes: Int
    number_of_seasons: Int
    origin_country: [String]
    original_language: String
    original_name: String
    overview: String!
    popularity: Int
    poster_path: String!
    production_companies: [Company]
    seasons: [Season]
    status: String
    type: String
    vote_average: Float!
    vote_count: Int!
    tmdbId: Int
    season: [Season]!
    watched: [Watched]!
  }

  type Author {
    id: Int
    credit_id: Int
    name: String
    gender: Int
    profile_path: String
  }

  type Network {
    id: Int
    name: String
    logo_path: String
    origin_country: String
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
    tv(id: ID): Tv
  }
`;

export const resolvers = {
  Query: {
    tv: async (parent, { id }) => {
      try {
        const tv = await getTvById(id);

        return tv;
      } catch (err) {
        throw new UserInputError(err.message);
      }
    },
  },
  Tv: {
    seasons: async (tv: Tv) => {
      const t0 = performance.now();
      const seasons = await getSeasonsByTvId(tv.id);
      const t1 = performance.now();
      console.log('Seasons took ' + (t1 - t0) + ' milliseconds.');

      return seasons;
    },
  },
};
