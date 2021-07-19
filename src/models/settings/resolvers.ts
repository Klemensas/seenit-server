import { isAuthenticated } from '../../apollo/helperResolvers';
import { getSettings, updateSettings, patchSettings } from './queries';
import { getUserById } from '../user/queries';
import { AuthenticatedContext } from '../../apollo';

export const resolvers = {
  Query: {
    settings: isAuthenticated.createResolver((parent, context, { user }) =>
      getSettings(user.id),
    ),
  },
  Mutation: {
    // TODO: user sends in pure regex here, double check if this needs escaping
    updateSettings: isAuthenticated.createResolver(
      (parent, settings, { user }) => updateSettings(settings, user.id),
    ),
    addToExtensionBlacklist: isAuthenticated.createResolver(async (parent, { blacklistItem }: { blacklistItem: string }, { user }: AuthenticatedContext) => {
      const { extension } = await getSettings(user.id)
      
      return patchSettings({ extension: { ...extension, blacklist: [...extension.blacklist, blacklistItem] }}, user.id)
    })
  },
  Settings: {
    user: async (user) => getUserById(user.id),
  },
};
