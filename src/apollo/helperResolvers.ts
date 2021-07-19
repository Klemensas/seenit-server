import { createResolver } from 'apollo-resolvers';
import { AuthenticationError } from 'apollo-server-express';

import { UnvalidatedContext } from '.';

export const isAuthenticated = createResolver(
  (parent, args, { user }: UnvalidatedContext, info) => {
    if (!user) {
      throw new AuthenticationError('Authentication required.');
    }
  },
);
