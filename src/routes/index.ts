import { Express } from 'express';

import { AuthRouter } from './auth';
import { UserRouter } from './user';
import { WatchedRouter } from './watched';
import { RatingRouter } from './rating';
import { ReviewRouter } from './review';

export class Router {
  public static initializeRoutes(app: Express) {
    app.use('/auth', new AuthRouter().router);
    app.use('/user', new UserRouter().router);
    app.use('/watched', new WatchedRouter().router);
    app.use('/rating', new RatingRouter().router);
    app.use('/review', new ReviewRouter().router);
    app.use('/*', (req, res) => res.sendStatus(404));
  }
}
