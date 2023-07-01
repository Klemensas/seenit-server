import * as express from 'express';
import * as http from 'http';
import * as https from 'https';
import * as fs from 'fs';
import * as compression from 'compression';
import * as morgan from 'morgan';
import * as bodyParser from 'body-parser';
import * as passport from 'passport';
import * as errorHandler from 'errorhandler';
import { ApolloServer } from 'apollo-server-express';
import { graphqlUploadExpress } from 'graphql-upload';
import dotenv = require('dotenv');

import { config } from './config';
import { Router } from './routes';
import { logger } from './util/logger';
import { InternalServerError } from './errors/internalServerError';
import { Auth } from './auth/auth';
import { initializeApolloServer } from './apollo';
// import {
//   findMatchingItems,
//   transformLetterboxdCsv,
// } from './models/import/service';
// import { createWatchedItemGraph } from './models/watched/queries';

dotenv.config();

function setupHttp(app: express.Express) {
  return http.createServer(app).listen(config.port);
}

function setupHttps(app: express.Express) {
  const options = {
    key: fs.readFileSync(config.tls.keyPath),
    cert: fs.readFileSync(config.tls.certPath),
  };

  return https.createServer(options, app).listen(config.port);
}

export class Server {
  public static app: express.Express;
  public static apolloServer: ApolloServer;
  public static async initializeApp(): Promise<http.Server | https.Server> {
    try {
      Server.app = express();
      await Server.configureApp();
      Server.initializeAuth();

      Router.initializeRoutes(Server.app);
      Server.app.use(errorHandler);

      process.on('unhandledRejection', (reason, p) => {
        logger.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
      });

      const setupServer = config.tls.certPath ? setupHttps : setupHttp;

      // console.time('parse');
      // const rcs = await transformLetterboxdCsv([
      //   'C:/X/letterboxd-export/diary.csv',
      //   'C:/X/letterboxd-export/reviews.csv',
      //   'C:/X/letterboxd-export/watched.csv',
      //   'C:/X/letterboxd-export/ratings.csv',
      // ]);
      // const oh = await findMatchingItems(Object.values(rcs));
      // console.timeEnd('parse');
      // console.log('parsed', oh);

      return setupServer(Server.app);
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
    Server.app.use(graphqlUploadExpress({ maxFiles: 1, maxFileSize: 102400 }));

    return initializeApolloServer(Server.app);
  }
}
