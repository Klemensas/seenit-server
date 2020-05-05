import { UserInputError, AuthenticationError } from 'apollo-server-express';

import { isAuthenticated } from '../../apollo/helperResolvers';
import { getUsers, getUser, createUser, getFullUser } from './queries';
import { Auth } from '../../auth/auth';
import { watchedResolver } from '../watched/model';

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
    login: async (parent, { email, password }) => {
      const user = await getFullUser({ email });

      if (!user) {
        throw new UserInputError('No user found with this login credentials.');
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
    watched: async (user, { cursor }) => {
      return watchedResolver({ userId: user.id }, cursor);
    },
  },
};
