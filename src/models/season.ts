import { gql, UserInputError } from 'apollo-server-core';

import { BaseModel } from './baseModel';
import { Tv } from './tv';
import { Episode } from './episode';
import { getSeasonById } from '../queries/seasonQueries';
import { getEpisodesBySeasonId } from '../queries/episodeQueries';
import { performance } from 'perf_hooks';

// tslint:disable: variable-name
export class Season extends BaseModel {
  readonly id: string;
  name?: string;
  overview?: string;
  air_date?: number | string;
  episode_count?: number;
  poster_path?: string;
  season_number?: number;

  // tslint:enable: variable-name
  tmdbId: number;

  tvId: string;
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

export const typeDefs = gql`
  type Season {
    id: ID!
    name: String
    overview: String
    air_date: String
    episode_count: Int
    poster_path: String
    season_number: Int
    tmdbId: Int
    tvId: ID
    tv: Tv
    episodes: [Episode]
  }

  extend type Query {
    season(id: ID): Season
  }
`;

export const resolvers = {
  Query: {
    season: (parent, { id }) => {
      try {
        const season = getSeasonById(id);

        return season;
      } catch (err) {
        throw new UserInputError(err.message);
      }
    },
  },
  Season: {
    episodes: async (season: Season) => {
      const t0 = performance.now();
      const seasonEpisodes = await getEpisodesBySeasonId(season.id);
      const t1 = performance.now();
      console.log('Season episodes took ' + (t1 - t0) + ' milliseconds.');

      // return getEpisodesBySeasonId(season.id)
      return seasonEpisodes;
    },
  },
};
