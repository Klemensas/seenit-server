import { UserInputError, AuthenticationError } from 'apollo-server-express';

import { isAuthenticated } from '../../apollo/helperResolvers';
import { getUsers, getUser, insertUserGraph, getFullUser } from './queries';
import { Auth } from '../../auth/auth';
import { watchedResolver } from '../watched/resolvers';
import { getSettings } from '../settings/queries';
import { User } from './model';
import { Settings } from '../settings/model';

export const resolvers = {
  Query: {
    users: isAuthenticated.createResolver(() => getUsers({})),
    user: (parent, { id, name }) => {
      return getUser(name ? { name } : { id });
    },
    me: isAuthenticated.createResolver((parent, args, { user }) =>
      getUser({ id: user.id }),
    ),
  },
  Mutation: {
    register: async (parent, { name, email, password }) => {
      const user = await insertUserGraph({
        name,
        email,
        password,
        settings: {
          general: {
            autoConvert: false,
          },
          extension: {
            autoTrack: false,
            minLengthSeconds: 360,
            blacklist: [],
          },
        } as Settings,
      });

      return { token: Auth.signToken(user), user };
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
    watched: async (user, { cursor }) =>
      watchedResolver({ userId: user.id }, cursor),
    settings: (user) => getSettings(user.id),
  },
};
