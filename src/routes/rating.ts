import { Request, Response, NextFunction } from 'express';

import { BaseRouter } from './baseRouter';
import { Auth } from '../auth/auth';
import * as ratingQueries from '../queries/ratingQueries';

export class RatingRouter extends BaseRouter {
  constructor() {
    super();
    this.buildRoutes();
  }

  public async post(req: Request, res: Response, next: NextFunction) {
    try {
      const rating = await ratingQueries.create({
        tmdbId: req.body.tmdbId,
        userId: req.user.id,
        value: req.body.value,
        symbol: req.body.symbol,
      });

      res.json(rating);
    } catch (err) {
      next(err);
    }
  }

  private buildRoutes() {
    this.router.post('/', Auth.isAuthenticated(), this.post);
  }
}
