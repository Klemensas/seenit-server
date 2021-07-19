import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Tv {
    id: ID!
    backdrop_path: String
    created_by: [Author]
    episode_run_time: [Int]
    first_air_date: String
    genres: [Genre]
    homepage: String!
    in_production: Boolean
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
