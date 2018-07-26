import * as passport from 'passport';

import { Auth } from '../auth/auth';
import { BaseRouter } from './baseRouter';

export class AuthRouter extends BaseRouter {
  constructor() {
    super();
    this.buildRoutes();
  }

  private buildRoutes() {
    this.router.post('/', passport.authenticate('local', (req, res) => res.json({ token: Auth.signToken(res.user) })));
  }
}
