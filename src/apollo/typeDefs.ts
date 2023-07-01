import { gql } from 'apollo-server-express';

export const baseType = gql`
  type Query {
    _: Boolean
  }
  type Mutation {
    _: Boolean
  }
  type Subscription {
    _: Boolean
  }
`;

export const serviceTypeDefs = gql`
  scalar Upload

  extend type Query {
    searchContent(title: String!): [SearchItem!]!
  }

  type TmdbMovie {
    id: Int
    title: String
    overview: String
    original_title: String
    original_language: String
    poster_path: String
    genre_ids: [Int]
    adult: Boolean
    release_date: String
    backdrop_path: String
    video: Boolean
    vote_count: Int
    vote_average: Float
    popularity: Int
    media_type: TmdbMediaType
  }

  type TmdbTv {
    id: Int
    name: String
    overview: String
    original_name: String
    original_language: String
    poster_path: String
    genre_ids: [Int]
    backdrop_path: String
    first_air_date: String
    origin_country: [String]
    vote_count: Int
    vote_average: Float
    popularity: Int
    media_type: TmdbMediaType
  }

  type TmdbPerson {
    popularity: Int
    id: Int
    vote_average: Int
    name: String
    profile_path: String
    adult: String
    known_for: TmdbMedia
    media_type: TmdbMediaType
  }

  type Search {
    results: [TmdbMedia!]
    page: Int!
    total_pages: Int!
    total_results: Int!
  }

  type SearchItem {
    id: String!
    tmdbId: Int!
    title: String!
    release_date: String
    popularity: Float
    poster_path: String
    type: ItemType!
  }
  # type TmdbSearch {
  #   results: [TmdbMedia!]
  #   page: Int!
  #   total_pages: Int!
  #   total_results: Int!
  # }

  union TmdbMedia = TmdbMovie | TmdbTv

  enum TmdbMediaType {
    Movie
    Tv
  }
`;
