import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Season {
    id: ID!
    name: String!
    overview: String!
    air_date: String
    episode_count: Int!
    poster_path: String
    season_number: Int!
    tmdbId: Int!
    tvId: ID!
    tv: Tv!
    episodes: [Episode!]!
  }

  extend type Query {
    season(id: ID): Season!
    seasons(itemId: ID!): [Season!]!
  }
`;
