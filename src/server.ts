import * as express from 'express';
import * as http from 'http';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import * as errorHandler from 'errorhandler';
import { ApolloServer } from 'apollo-server-express';
import morgan = require('morgan');
import dotenv = require('dotenv');

import { config } from './config';
import { Router } from './routes';
import { logger } from './util/logger';
import { InternalServerError } from './errors/internalServerError';
import { Auth } from './auth/auth';
import { initializeApolloServer } from './apollo';

dotenv.config();

export class Server {
  public static app: express.Express;
  public static apolloServer: ApolloServer;
  public static async initializeApp(): Promise<http.Server> {
    try {
      Server.app = express();
      Server.configureApp();
      Server.initializeAuth();

      Router.initializeRoutes(Server.app);
      Server.app.use(errorHandler);

      process.on('unhandledRejection', (reason, p) => {
        logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
      });

      return Server.app.listen(config.port);
    } catch (error) {
      throw new InternalServerError(error.message);
    }

  }

  private static initializeAuth() {
    Server.app.use(passport.initialize());
    Server.app.use(passport.initialize());
    Auth.useLocalStrategy();
    Auth.useBearerStrategy();
  }

  private static configureApp() {
    Server.app.use(bodyParser.urlencoded({ extended: true }));
    Server.app.use(bodyParser.json());
    Server.app.use(compression());
    Server.app.use(morgan('dev'));
    initializeApolloServer(Server.app);
  }
}
