import { Response, NextFunction } from 'express';

import { BaseRouter } from './baseRouter';
import { Auth } from '../auth/auth';
import { createUser, getUserById } from '../queries/userQueries';
import { Request } from '../../types/helper';

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

  public async getUserProfile(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.params.userId) { return next('Missing userId'); }
      const user = await getUserById(req.params.userId);

      res.json(user);
    } catch (err) {
      next(err);
    }
  }

  private buildRoutes() {
    this.router.get('/me', Auth.isAuthenticated(), this.getCurrentUser);
    this.router.get('/:userId', this.getUserProfile);
    this.router.post('/', this.post);
  }
}
