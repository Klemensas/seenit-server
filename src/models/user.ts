import * as bcrypt from 'bcrypt';
import { QueryContext } from 'objection';
import { gql, UserInputError, AuthenticationError } from 'apollo-server';

import { BaseModel } from './baseModel';
import { getUsers, getUserById, createUser, getFullUser } from '../queries/userQueries';
import { getWatched } from '../queries/watchedQueries';
import { Auth } from '../auth/auth';
import { isAuthenticated } from '../apollo/resolvers';

export class User extends BaseModel {
  readonly id: number;
  name: string;
  email: string;
  password: string;
  salt: string;

  static tableName = 'User';

  static relationMappings = {
    watched: {
      relation: BaseModel.HasManyRelation,
      modelClass: 'watched',
      join: {
        from: 'User.id',
        to: 'Watched.id',
      },
    },
  };

  static jsonSchema = {
    type: 'object',
    required: ['name', 'email', 'password'],

    properties: {
      id: { type: 'integer' },
      name: { type: 'string', unique: 'true' },
      email: { type: 'string', unique: 'true' },
      password: { type: 'string' },
      salt: { type: 'string' },
    },
  };

  authenticate(password: string) {
    return this.encryptPassword(password)
      .then((encryptedPass) => this.password === encryptedPass);
  }

  encryptPassword(password: string): Promise<string> {
    if (!password || !this.salt) {
      throw new Error('Missing password');
    }

    return bcrypt.hash(password, this.salt);
  }

  generateSalt(rounds = 10) {
    return bcrypt.genSalt(10);
  }

  async updatePassword(): Promise<void> {
    if (this.password) {
      if ((!this.password || !this.password.length)) {
        throw new Error('Invalid password');
      }
    }

    this.salt = await this.generateSalt();
    this.password = await this.encryptPassword(this.password);
  }

  async $beforeInsert(queryContext: QueryContext) {
    super.$beforeInsert(queryContext);
    await this.updatePassword();
  }
}

export const typeDefs = gql`
  extend type Query {
    users: [User!]
    user(id: ID!): User
    me: User
  }

  extend type Mutation {
    register(
      name: String!
      email: String!
      password: String!
    ): LocalAuth!
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
    watched: [Watched!]
  }
  type LocalAuth {
    user: User!
    token: String!
  }
`;

export const resolvers = {
  Query: {
    users: isAuthenticated.createResolver((parent, args, { models }) => getUsers({})),
    user: (parent, { id }, { models }) => {
      return getUserById(id);
    }
  },
  Mutation: {
    register: async (parent, { name, email, password }, { models }) => {
      const user = await createUser({
        name,
        email,
        password,
      });

      return { token: Auth.signToken(user) };
    },
    login: async (parent, { email, password }, { models }) => {
      const user = await getFullUser({ email });

      if (!user) {
        throw new UserInputError(
          'No user found with this login credentials.',
        );
      }

      const isValid = await Auth.comparePasswords(password, user.password);

      if (!isValid) {
        throw new AuthenticationError('Invalid password.');
      }

      const cleanUser = { ...user };
      delete cleanUser.password;
      delete cleanUser.salt;
      return { token: Auth.signToken(user), user: cleanUser };
    },
  },
  User: {
    watched: (user, args, { loaders }) => getWatched({ userId: user.id })
  }
}