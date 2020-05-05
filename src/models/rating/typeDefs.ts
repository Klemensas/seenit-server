import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  type Rating {
    id: ID!
    value: Float!
    tmdbId: Int!
    userId: ID!
    createdAt: Float!
    updatedAt: Float!
    user: User
    watched: Watched
    tvItemType: TvItemType
    tvItemId: ID
    tvItem: TvItem
  }

  input RatingInput {
    id: ID
    value: Float!
  }
`;
