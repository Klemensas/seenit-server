import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  extend type Query {
    users: [User!]
    user(id: ID, name: String): User!
    me: User!
  }

  extend type Mutation {
    register(name: String!, email: String!, password: String!): LocalAuth!
    login(email: String!, password: String!): LocalAuth!
    # updateUser(username: String!): User!
    # deleteUser(id: ID!): Boolean!
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
