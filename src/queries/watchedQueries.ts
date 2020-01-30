import * as Knex from 'knex';
import { Transaction, QueryBuilder, Page } from 'objection';

import { knex } from '../config';
import { Watched } from '../models/watched';

export const perPage = 12;

export function getWatchedById(id: number, connection: Transaction | Knex = knex) {
  return Watched
    .query(connection)
    .findById(id);
}

export function getWatched(
  where: Partial<Watched>,
  pagination: { count: number, after: string | number } = { count: perPage, after: Date.now() },
  connection: Transaction | Knex = knex,
) {
  return Watched
    .query(connection)
    .where(where)
    // .withGraphJoined('review', { joinOperation: 'innerJoin' })
    .orderBy('Watched.createdAt', 'DESC')
    .where('Watched.createdAt', '<', pagination.after)
    .page(0, pagination.count);
}

export async function getWatchedWithReviews(
  where: Partial<Watched>,
  pagination: { count: number, after: string | number } = { count: perPage, after: Date.now() },
  connection: Transaction | Knex = knex,
) {
  return getWatched(Object.entries(where).reduce((acc, [key, value]) => ({ ...acc, [`Watched.${key}`]: value }), {}), pagination, connection)
    .withGraphJoined('review', { joinOperation: 'innerJoin' });
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
