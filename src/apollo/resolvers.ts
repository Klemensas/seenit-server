import { GraphQLUpload } from 'graphql-upload';

import { searchContent } from '../models/queries';

export const serviceResolvers = {
  Upload: GraphQLUpload,
  Query: {
    searchContent: (parent, { title }, { models }) => {
      if (!title) return [];

      return searchContent({ title });
    },
  },
  TmdbMedia: {
    __resolveType(obj, context, info) {
      switch (obj.media_type) {
        case 'Movie':
          return 'TmdbMovie';
        case 'Tv':
          return 'TmdbTv';
        case 'person':
          return 'TmdbPerson';
        default:
          return null;
      }
    },
  },
};
