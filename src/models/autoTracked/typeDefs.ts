import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  union AutoTrackedResult = AutoTracked | Watched

  type AutoTrackedMetaTvData {
    season: String
    episode: String
  }

  type AutoTrackedMeta {
    title: String
    tvData: AutoTrackedMetaTvData
    filename: String
    url: String
    provider: String!
  }

  type AutoTracked {
    id: ID!
    userId: ID!
    user: User!
    itemType: ItemType
    item: Item
    tvItemType: TvItemType
    tvItemId: ID
    tvItem: TvItem
    meta: AutoTrackedMeta!
    createdAt: Float!
    updatedAt: Float!
  }

  input TvDataInput {
    season: String
    episode: String
  }

  input AutoTrackedMetaInput {
    title: String
    tvData: TvDataInput
    filename: String
    url: String
    provider: String!
  }

  type AutoTrackedCursor {
    autoTracked: [AutoTracked!]!
    cursor: String
    hasMore: Boolean!
  }

  type ConvertedAutoTracked {
    removedIds: [ID!]!
    watched: [Watched!]!
  }

  extend type Query {
    autoTrackedList(userId: ID!, cursor: String): AutoTrackedCursor!
    autoTracked(id: ID!): AutoTracked!
  }

  extend type Mutation {
    addAutoTracked(
      meta: AutoTrackedMetaInput!
      createdAt: Float!
      itemId: ID
      itemType: ItemType
      tvItemId: ID
      tvItemType: TvItemType
    ): AutoTrackedResult!
    removeAutoTracked(ids: [ID!]!): [ID!]!
    convertAutoTracked(ids: [ID!]!): ConvertedAutoTracked!
  }
`;
