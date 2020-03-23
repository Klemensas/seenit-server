import { createResolver } from 'apollo-resolvers';
import { AuthenticationError } from 'apollo-server-express';

export const isAuthenticated = createResolver(
  (parent, args, { user }, info) => {
    if (!user) {
      throw new AuthenticationError('Authentication required.');
    }
  },
);
