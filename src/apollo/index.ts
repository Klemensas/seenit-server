import * as express from 'express';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import { mergeDeep } from 'apollo-utilities';

import {
  typeDefs as watchedTypeDefs,
  resolvers as watchedResolvers,
} from '../models/watched';
import {
  typeDefs as userTypeDefs,
  resolvers as userResolvers,
} from '../models/user';
import {
  typeDefs as movieTypeDefs,
  resolvers as movieResolvers,
} from '../models/movie';
import { typeDefs as tvTypeDefs, resolvers as tvResolvers } from '../models/tv';
import {
  typeDefs as seasonTypeDefs,
  resolvers as seasonResolvers,
} from '../models/season';
import {
  typeDefs as episodeTypeDefs,
  resolvers as episodeResolvers,
} from '../models/episode';
import { typeDefs as ratingTypeDefs } from '../models/rating';
import { typeDefs as reviewTypeDefs } from '../models/review';
import reviewResolvers from '../models/review/resolvers';
import { Auth } from '../auth/auth';
import { baseType, serviceTypeDefs } from './typeDefs';
import { serviceResolvers } from './resolvers';
import { config } from '../config';

export function initializeApolloServer(app: express.Express) {
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
    ],
    // TODO: mergeDeep is apollo internal method, investigate use of array. Alternative solution is using makeExecutableSchema
    resolvers: mergeDeep(
      watchedResolvers,
      userResolvers,
      serviceResolvers,
      movieResolvers,
      tvResolvers,
      seasonResolvers,
      episodeResolvers,
      reviewResolvers,
    ),
    context: async ({ req, res }) => {
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
    tracing: config.env !== 'production',
  });

  apolloServer.applyMiddleware({ app });
  return apolloServer;
}
