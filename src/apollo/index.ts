import * as express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from 'apollo-server-core';

import { typeDefs as watchedTypeDefs } from '../models/watched/typeDefs';
import { resolvers as watchedResolvers } from '../models/watched/resolvers';
import { typeDefs as userTypeDefs } from '../models/user/typeDefs';
import { resolvers as userResolvers } from '../models/user/resolvers';
import { typeDefs as movieTypeDefs } from '../models/movie/typeDefs';
import { resolvers as movieResolvers } from '../models/movie/resolvers';
import { typeDefs as tvTypeDefs } from '../models/tv/typeDefs';
import { resolvers as tvResolvers } from '../models/tv/resolvers';
import { typeDefs as seasonTypeDefs } from '../models/season/typeDefs';
import { resolvers as seasonResolvers } from '../models/season/resolvers';
import { typeDefs as episodeTypeDefs } from '../models/episode/typeDefs';
import { resolvers as episodeResolvers } from '../models/episode/resolvers';
import { typeDefs as ratingTypeDefs } from '../models/rating/typeDefs';
import { typeDefs as reviewTypeDefs } from '../models/review/typeDefs';
import reviewResolvers from '../models/review/resolvers';
import { resolvers as settingsResolvers } from '../models/settings/resolvers';
import { typeDefs as settingsTypeDefs } from '../models/settings/typeDefs';
import { typeDefs as autoTrackedTypeDefs } from '../models/autoTracked/typeDefs';
import autoTrackedResolvers from '../models/autoTracked/resolvers';
import { typeDefs as importTypeDefs } from '../models/import/typeDefs';
import { resolvers as importResolvers } from '../models/import/resolvers';

import { Auth } from '../auth/auth';
import { baseType, serviceTypeDefs } from './typeDefs';
import { serviceResolvers } from './resolvers';
import { User } from '../models/user/model';

export type FullContext = { user: User };
export type UnvalidatedContext = Partial<FullContext>;
export type AuthenticatedContext = Pick<FullContext, 'user'>;

export async function initializeApolloServer(app: express.Express) {
  try {
    const apolloServer = new ApolloServer({
      introspection: true,
      typeDefs: [
        baseType,
        movieTypeDefs,
        tvTypeDefs,
        seasonTypeDefs,
        episodeTypeDefs,
        watchedTypeDefs,
        userTypeDefs,
        serviceTypeDefs,
        ratingTypeDefs,
        reviewTypeDefs,
        autoTrackedTypeDefs,
        settingsTypeDefs,
        importTypeDefs,
      ],
      resolvers: [
        watchedResolvers,
        userResolvers,
        serviceResolvers,
        movieResolvers,
        tvResolvers,
        seasonResolvers,
        episodeResolvers,
        reviewResolvers,
        autoTrackedResolvers,
        settingsResolvers,
        importResolvers,
      ],
      context: async ({ req, res }): Promise<FullContext> => {
        if (req) {
          if (req.headers.authorization) {
            const token =
              req.headers.authorization.indexOf('Bearer ') === 0
                ? req.headers.authorization.slice(7)
                : null;
            try {
              const user = await Auth.getUserFromToken(token);
              return { user };
            } catch (err) {
              throw new AuthenticationError('Invalid token. Sign in again.');
            }
          }
        }
      },
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer: app })],
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({ app });

    return apolloServer;
  } catch (err) {
    console.error('Apollo init failed', err);
  }
}
