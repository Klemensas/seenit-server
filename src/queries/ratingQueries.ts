import * as Knex from 'knex';
import { Transaction } from 'objection';

import { knex } from '../config';
import { Rating } from '../models/rating';

export function getRatingById(id: number, connection: Transaction | Knex = knex) {
  return Rating
    .query(connection)
    .findById(id);
}

export function getRating(where: Partial<Rating>, connection: Transaction | Knex = knex) {
  return Rating
    .query(connection)
    .where(where);
}

export function getRatingByWatched(watchedId: number, connection: Transaction | Knex = knex) {
  return Rating
    .query(connection)
    .findOne({ watchedId });
}

export function create(rating: Partial<Rating>, connection: Transaction | Knex = knex) {
  return Rating
    .query(connection)
    .insert(rating);
}
