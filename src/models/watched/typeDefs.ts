import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  enum ItemType {
    Movie
    Tv
  }

  enum TvItemType {
    Season
    Episode
  }

  union Item = Movie | Tv
  union TvItem = Season | Episode

  type Watched {
    id: ID!
    tmdbId: Int!
    createdAt: Float!
    updatedAt: Float!
    userId: ID!
    user: User!
    itemType: ItemType!
    item: Item!
    rating: Rating
    review: Review
    tvItemType: TvItemType
    tvItemId: ID
    tvItem: TvItem
  }

  type WatchedCursor {
    watched: [Watched!]!
    cursor: String
    hasMore: Boolean!
  }

  extend type Query {
    watches(
      userId: ID
      itemId: ID
      itemType: ItemType
      tvItemId: ID
      tvItemType: TvItemType
      cursor: String
    ): WatchedCursor!
    watched(id: ID!): Watched!
  }

  extend type Mutation {
    addWatched(
      itemId: ID!
      itemType: ItemType!
      rating: RatingInput
      review: ReviewInput
      createdAt: Float
      tvItemId: ID
      tvItemType: TvItemType
    ): Watched!
    editWatched(
      id: ID!
      createdAt: Float
      rating: RatingInput
      review: ReviewInput
      tvItemId: ID
      tvItemType: TvItemType
    ): Watched!
    removeWatched(itemId: ID!): ID!
  }
`;
