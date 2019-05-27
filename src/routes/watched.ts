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
      const tmdbId = req.body.tmdbId;
      const rating: Partial<Rating> = req.body.rating ? {
        userId,
        tmdbId,
        value: req.body.rating.value,
        symbol: req.body.symbol,
      } : null;
      const review: Partial<Review> = req.body.review ? {
        userId,
        tmdbId,
        body: req.body.review.body,
      } : null;

      const watched = await watchedQueries.createWatchedGraph({
        userId,
        tmdbId,
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
