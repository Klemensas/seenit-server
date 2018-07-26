import { Express } from 'express';

import { AuthRouter } from './auth';
import { UserRouter } from './user';

export class Router {
  public static initializeRoutes(app: Express) {
    app.use('/auth', new AuthRouter().router);
    app.use('/users', new UserRouter().router);
    app.use('/*', (req, res) => res.sendStatus(404));
  }
}
