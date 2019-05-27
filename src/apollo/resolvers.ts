import { createResolver } from 'apollo-resolvers';
import { AuthenticationError } from 'apollo-server-express';

import TMDB from '../services/TMDB';

export const isAuthenticated = createResolver((parent, args, { user }, info) => {
  if (!user) { throw new AuthenticationError('Authentication required.'); }
});

export const serviceResolvers = {
  Query: {
    searchContent: isAuthenticated.createResolver((parent, { title }, { models }) => TMDB.search(title)),
  },
  TmdbMedia: {
    __resolveType(obj, context, info) {
      switch (obj.media_type) {
        case 'movie':
          return 'TmdbMovie';
        case 'tv':
          return 'TmdbTv';
        case 'person':
          return 'TmdbPerson';
        default:
          return null;
      }
    },
  },
};
