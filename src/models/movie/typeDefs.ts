import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Movie {
    id: ID!
    adult: Boolean!
    backdrop_path: String
    belongs_to_collection: Collection
    budget: Int!
    genre: [Genre]
    homepage: String
    imdb_id: String
    original_language: String
    original_title: String
    overview: String!
    popularity: Float
    poster_path: String
    production_companies: [Company]
    production_countries: [Country]
    release_date: String!
    revenue: Int
    runtime: Int
    spoken_languages: [Language]
    status: String
    tagline: String
    title: String!
    video: Boolean
    vote_average: Float!
    vote_count: Int!
    tmdbId: Int
    watched(cursor: String, filter: String): WatchedCursor!
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

  extend type Query {
    movie(id: ID): Movie!
  }
`;
