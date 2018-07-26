import { Request, Response, NextFunction } from 'express';

import { BaseRouter } from './baseRouter';
import { Auth } from '../auth/auth';
import { createUser } from '../queries/user';

export class UserRouter extends BaseRouter {
  constructor() {
    super();
    this.buildRoutes();
  }

  public async post(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await createUser({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
      });
      const token = Auth.signToken(user);

      res.json({ token });
    } catch (err) {
      next(err);
    }
  }

  public getCurrentUser(req: Request, res: Response, next: NextFunction) {
    res.json(req.user);
  }

  private buildRoutes() {
    this.router.get('/me', Auth.isAuthenticated(), this.getCurrentUser);
    this.router.post('/', this.post);
  }
}
