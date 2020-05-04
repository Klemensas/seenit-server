import { gql, UserInputError } from 'apollo-server-express';

import { knex } from '../config';
import { BaseModel } from './baseModel';
import { Watched } from './watched';
import { Genre, Company } from './movie';
import { getTvById } from '../queries/tvQueries';
import { Season } from './season';
import { Episode } from './episode';
import { getSeasonsByTvId } from '../queries/seasonQueries';
import { performance } from 'perf_hooks';
import {
  getPaginatedWatched,
  getWatchedWithReviews,
} from '../queries/watchedQueries';
import { perPage } from '../config/constants';
import { ItemTypes } from '../util/watchedItemHelper';

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

  $formatDatabaseJson(json) {
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
    backdrop_path: String
    created_by: [Author]
    episode_run_time: [Int]
    first_air_date: String!
    genres: [Genre]
    homepage: String!
    in_production: Boolean!
    languages: [String]
    last_air_date: String!
    last_episode_to_air: Episode
    name: String!
    next_episode_to_air: Episode
    networks: [Network]
    number_of_episodes: Int!
    number_of_seasons: Int!
    origin_country: [String]
    original_language: String!
    original_name: String!
    overview: String!
    popularity: Int!
    poster_path: String
    production_companies: [Company]
    seasons: [Season!]!
    status: String!
    type: String!
    vote_average: Float!
    vote_count: Int!
    tmdbId: Int
    watched(cursor: String, filter: String): WatchedCursor!
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

  extend type Query {
    tv(id: ID): Tv!
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

    watched: async (tv, { cursor, filter }) => {
      const count = perPage;
      const query = filter ? getWatchedWithReviews : getPaginatedWatched;
      cursor = cursor || Date.now();

      const { total, results } = await query(
        { itemId: tv.id },
        { count, after: cursor },
      );

      const lastItem = results[results.length - 1] as any;
      const newCursor = lastItem ? lastItem.createdAt : undefined;
      const hasMore = total > count;

      return { watched: results, hasMore, cursor: newCursor, filter };
    },
  },
};
