import * as Knex from 'knex';
import { Transaction } from 'objection';

import { knex } from '../config';
import { Watched } from '../models/watched';

export function getWatchedById(id: number, connection: Transaction | Knex = knex) {
  return Watched
    .query(connection)
    .findById(id);
}

export function getWatched(where: Partial<Watched>, connection: Transaction | Knex = knex) {
  return Watched
    .query(connection)
    .where(where);
}

export function createWatched(watched: Partial<Watched>, connection: Transaction | Knex = knex) {
  return Watched
    .query(connection)
    .insert(watched);
}

export function createWatchedGraph(watched: Partial<Watched>, connection: Transaction | Knex = knex) {
  return Watched
    .query(connection)
    .insertGraph(watched, {
      relate: true,
    });
}
