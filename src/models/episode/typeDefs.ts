import { gql } from 'apollo-server-express';

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
    season: Season!
  }

  extend type Query {
    episode(id: ID): Episode!
  }
`;
