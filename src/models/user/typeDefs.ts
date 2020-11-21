import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  extend type Query {
    users: [User!]
    user(id: ID, name: String): User!
    me: User!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    # password: String!
    # salt: String!
    createdAt: Float!
    updatedAt: Float!
    watched(cursor: String): WatchedCursor!
    settings: Settings!
  }
  type LocalAuth {
    user: User!
    token: String!
  }
`;
