import { isAuthenticated } from '../../apollo/helperResolvers';
import { getSettings, updateSettings } from './queries';
import { getUserById } from '../user/queries';

export const resolvers = {
  Query: {
    settings: isAuthenticated.createResolver((parent, context, { user }) =>
      getSettings(user.id),
    ),
  },
  Mutation: {
    updateSettings: isAuthenticated.createResolver(
      (parent, settings, { user }) => updateSettings(settings, user.id),
    ),
  },
  Settings: {
    user: async (user) => getUserById(user.id),
  },
};
