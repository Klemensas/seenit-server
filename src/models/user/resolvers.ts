import { isAuthenticated } from '../../apollo/helperResolvers';
import { getUsers, getUser } from './queries';
import { watchedResolver } from '../watched/resolvers';
import { getSettings } from '../settings/queries';

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
  User: {
    watched: async (user, { cursor }) =>
      watchedResolver({ userId: user.id }, cursor),
    settings: (user) => getSettings(user.id),
  },
};
