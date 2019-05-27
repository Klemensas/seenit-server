import * as Knex from 'knex';
import { Transaction } from 'objection';

import { knex } from '../config';
import { Review } from '../models/review';

export function getReviewById(id: number, connection: Transaction | Knex = knex) {
  return Review
    .query(connection)
    .findById(id);
}

export function getReview(where: Partial<Review>, connection: Transaction | Knex = knex) {
  return Review
    .query(connection)
    .where(where);
}

export function getReviewByWatched(watchedId: number, connection: Transaction | Knex = knex) {
  return Review
    .query(connection)
    .findOne({ watchedId });
}

export function create(review: Partial<Review>, connection: Transaction | Knex = knex) {
  return Review
    .query(connection)
    .insert(review);
}
