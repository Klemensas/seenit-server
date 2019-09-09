import { Request, Response, NextFunction } from 'express';

import { BaseRouter } from './baseRouter';
import { Auth } from '../auth/auth';
import { Rating } from '../models/rating';
import { Review } from '../models/review';
import * as watchedQueries from '../queries/watchedQueries';

export class WatchedRouter extends BaseRouter {
  constructor() {
    super();
    this.buildRoutes();
  }

  public async post(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const rating: Partial<Rating> = req.body.rating ? {
        userId,
        value: req.body.rating.value,
        symbol: req.body.symbol,
      } : null;
      const review: Partial<Review> = req.body.review ? {
        userId,
        body: req.body.review.body,
      } : null;

      const watched = await watchedQueries.createWatchedGraph({
        userId,
        rating,
        review,
      });

      res.json(watched);
    } catch (err) {
      next(err);
    }
  }

  private buildRoutes() {
    this.router.post('/', Auth.isAuthenticated(), this.post);
  }
}
