import * as passport from 'passport';

import { Auth } from '../auth/auth';
import { BaseRouter } from './baseRouter';

export class AuthRouter extends BaseRouter {
  constructor() {
    super();
    this.buildRoutes();
  }

  private buildRoutes() {
    this.router.post('/', (req, res, next) =>
      passport.authenticate('local', (err, user, info) => {
        if (err || !user) {
          return res
            .status(401)
            .json({ message: 'Email or password incorrect' });
        }
        const token = Auth.signToken(user);
        res.json({ token, user });
      })(req, res, next),
    );
  }
}
