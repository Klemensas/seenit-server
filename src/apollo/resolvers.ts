import { createResolver } from 'apollo-resolvers';
import { AuthenticationError } from 'apollo-server-express';

import TMDB from '../services/TMDB';
import { Tv } from '../models/tv';
import { Movie } from '../models/movie';
import { knex } from '../config';

export const isAuthenticated = createResolver((parent, args, { user }, info) => {
  if (!user) { throw new AuthenticationError('Authentication required.'); }
});

export const serviceResolvers = {
  Query: {
    searchContent: isAuthenticated.createResolver((parent, { title }, { models }) => {
      if (!title) { return []; }

      const formattedTitle = title.slice(0, 100).trim().replace(' ', ' <-> ') + ':*';
      // TODO: improve typing here
      return Movie.query()
        .select(
          'id',
          'tmdbId',
          'title',
          'release_date',
          'popularity',
          knex.raw(`'movie' as type`),
          knex.raw(`ts_rank_cd("titleVector", to_tsquery('${formattedTitle}'), 16) as score`),
        )
        .where(knex.raw(`"titleVector" @@ to_tsquery('${formattedTitle}')`))
        .unionAll([
          Tv.query()
            .select(
              'id',
              'tmdbId',
              'name as title',
              'first_air_date as release_date',
              'popularity',
              knex.raw(`'tv' as type`),
              knex.raw(`ts_rank_cd("titleVector", to_tsquery('${formattedTitle}'), 16) as score`),
            )
            .where(knex.raw(`"titleVector" @@ to_tsquery('${formattedTitle}')`)) as any
        ])
        // Type coercion needed due to objection missing type, remove once updated
        .orderBy([
          { column: 'score',  order: 'desc' },
          { column: 'popularity', order: 'desc' },
        ] as any)
        .limit(20)
        // .omit(['score', 'popularity'])
        .debug().then((r) => {
          console.log('wat', r);
          return r;
        })
    })
    // searchContent: isAuthenticated.createResolver((parent, { title }, { models }) => TMDB.search(title)),
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
