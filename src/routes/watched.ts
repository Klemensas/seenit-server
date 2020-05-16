import { Response, NextFunction } from 'express';

import { BaseRouter } from './baseRouter';
import { Auth } from '../auth/auth';
import { Rating } from '../models/rating/model';
import { Review } from '../models/review/model';
import * as watchedQueries from '../models/watched/queries';
import { Request } from '../../types/helper';

export class WatchedRouter extends BaseRouter {
  constructor() {
    super();
    this.buildRoutes();
  }

  public async post(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      const rating: Partial<Rating> = req.body.rating
        ? {
            userId,
            value: req.body.rating.value,
            symbol: req.body.symbol,
          }
        : null;
      const review: Partial<Review> = req.body.review
        ? {
            userId,
            body: req.body.review.body,
          }
        : null;

      const watched = await watchedQueries.createWatchedItemGraph({
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
