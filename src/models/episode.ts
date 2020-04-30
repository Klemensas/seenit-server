import { gql, UserInputError } from 'apollo-server-core';

import { BaseModel } from './baseModel';
import { Season } from './season';
import { getEpisodeById } from '../queries/episodeQueries';
import { performance } from 'perf_hooks';

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

export const typeDefs = gql`
  type Episode {
    id: ID!
    name: String!
    overview: String!
    episode_number: Int!
    air_date: String
    production_code: String
    still_path: String
    vote_average: Float!
    vote_count: Int!
    tmdbId: Int!
    seasonId: ID!
    season: [Season]
  }

  extend type Query {
    episode(id: ID): Episode!
  }
`;

export const resolvers = {
  Query: {
    episode: (parent, { id }) => {
      console.log('episode', id);
      try {
        const t0 = performance.now();
        const episode = getEpisodeById(id);
        const t1 = performance.now();
        console.log('Episode fetch took ' + (t1 - t0) + ' milliseconds.');

        return episode;
      } catch (err) {
        throw new UserInputError(err.message);
      }
    },
  },
};
