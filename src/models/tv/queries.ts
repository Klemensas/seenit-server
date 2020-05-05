import * as Knex from 'knex';
import { Transaction } from 'objection';

import { knex } from '../../config';
import { Tv } from './model';

export function getTvById(id: string, connection: Transaction | Knex = knex) {
  return Tv.query(connection).findById(id);
}

export function getTvByTmdbId(
  tmdbId: number,
  connection: Transaction | Knex = knex,
) {
  return Tv.query(connection).findOne({ tmdbId });
}

export function getTv(
  where: Partial<Tv>,
  connection: Transaction | Knex = knex,
) {
  return Tv.query(connection).where(where);
}

export function getTvByWatched(
  watchedId: number,
  connection: Transaction | Knex = knex,
) {
  return Tv.query(connection).findOne({ watchedId });
}

export function createTv(
  tv: Partial<Tv>,
  connection: Transaction | Knex = knex,
) {
  return Tv.query(connection).insert(tv);
}
