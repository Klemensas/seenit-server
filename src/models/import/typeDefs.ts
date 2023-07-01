import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type LetterboxdItem {
    date: String!
    name: String!
    year: String!
    watchedDate: String
    rating: String
    review: String
  }

  type WatchedImport {
    tmdbId: Int!
    itemId: ID
    itemType: ItemType!
    tvItemId: ID
    tvItemType: TvItemType
    createdAt: Float!
    item: SearchItem!
    rating: Rating
    review: Review
  }

  type ImportResult {
    imported: WatchedImport
    original: LetterboxdItem!
  }

  extend type Query {
    importLetterboxd(file: Upload!): [ImportResult!]!
  }
`;
