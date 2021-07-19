import { Knex } from 'knex';
import { Transaction } from 'objection';

import { knex } from '../../config';
import { Review } from './model';
import { perPage } from '../../config/constants';

export function getReviewById(
  id: number,
  connection: Transaction | Knex = knex,
) {
  return Review.query(connection).findById(id);
}

export function getPaginatedReviews(
  where: Partial<Review>,
  pagination: { count: number; after: string | number } = {
    count: perPage,
    after: Date.now(),
  },
  connection: Transaction | Knex = knex,
) {
  return Review.query(connection)
    .where(where)
    .orderBy('Review.createdAt', 'DESC')
    .where('Review.createdAt', '<', pagination.after)
    .page(0, pagination.count);
}

export function getReview(
  where: Partial<Review>,
  connection: Transaction | Knex = knex,
) {
  return Review.query(connection).where(where);
}

export function getReviewByWatched(
  watchedId: number,
  connection: Transaction | Knex = knex,
) {
  return Review.query(connection).findOne({ watchedId });
}

export function create(
  review: Partial<Review>,
  connection: Transaction | Knex = knex,
) {
  return Review.query(connection).insert(review);
}
