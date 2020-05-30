import { UserInputError, AuthenticationError } from 'apollo-server-express';

import { isAuthenticated } from '../../apollo/helperResolvers';
import { getUsers, getUser, createUser, getFullUser } from './queries';
import { Auth } from '../../auth/auth';
import { watchedResolver } from '../watched/resolvers';

export const resolvers = {
  Query: {
    users: isAuthenticated.createResolver(() => getUsers({})),
    user: (parent, { id, name }) => {
      return getUser(name ? { name } : { id });
    },
  },
  Mutation: {
    register: async (parent, { name, email, password }) => {
      const user = await createUser({
        name,
        email,
        password,
      });

      return { token: Auth.signToken(user) };
    },
    login: async (parent, { email, password }, context) => {
      console.error('owowo');
      const { user, ...dat } = await context.authenticate('graphql-local', {
        email,
        password,
      });

      const log = await context.login(user);

      console.error('uuu', user, log, dat);

      return { user, token: '' };
    },
  },
  User: {
    watched: async (user, { cursor }) => {
      return watchedResolver({ userId: user.id }, cursor);
    },
  },
};
