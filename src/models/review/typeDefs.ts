import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Review {
    id: ID!
    body: String!
    tmdbId: Int!
    userId: ID!
    user: User!
    watched: Watched!
    tvItemType: TvItemType
    tvItemId: ID
    tvItem: TvItem
  }

  input ReviewInput {
    id: ID
    body: String!
  }

  type ReviewCursor {
    reviews: [Review!]!
    cursor: String
    hasMore: Boolean!
  }

  extend type Query {
    reviews(
      userId: ID
      itemId: ID
      itemType: ItemType
      tvItemId: ID
      tvItemType: TvItemType
      cursor: String
    ): ReviewCursor!
  }
`;
