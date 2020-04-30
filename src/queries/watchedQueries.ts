import * as Knex from 'knex';
import { Transaction } from 'objection';

import { knex } from '../config';
import { Watched } from '../models/watched';
import { perPage } from '../config/constants';

export function getWatchedById(
  id: string,
  connection: Transaction | Knex = knex,
) {
  return Watched.query(connection).findById(id);
}

export function deleteWatchedById(
  id: string,
  connection: Transaction | Knex = knex,
) {
  return Watched.query(connection).deleteById(id);
}

export function getPaginatedWatched(
  where: Partial<Watched>,
  pagination: { count: number; after: string | number } = {
    count: perPage,
    after: Date.now(),
  },
  connection: Transaction | Knex = knex,
) {
  return (
    Watched.query(connection)
      .where(where)
      // .withGraphJoined('review', { joinOperation: 'innerJoin' })
      .orderBy('Watched.createdAt', 'DESC')
      .where('Watched.createdAt', '<', pagination.after)
      .page(0, pagination.count)
  );
}

export async function getWatchedWithReviews(
  where: Partial<Watched>,
  pagination: { count: number; after: string | number } = {
    count: perPage,
    after: Date.now(),
  },
  connection: Transaction | Knex = knex,
) {
  return getPaginatedWatched(
    Object.entries(where).reduce(
      (acc, [key, value]) => ({ ...acc, [`Watched.${key}`]: value }),
      {},
    ),
    pagination,
    connection,
  ).withGraphJoined('review', { joinOperation: 'innerJoin' });
}

export function createWatched(
  watched: Partial<Watched>,
  connection: Transaction | Knex = knex,
) {
  return Watched.query(connection).insert(watched);
}

export function createWatchedGraph(
  watched: Partial<Watched>,
  connection: Transaction | Knex = knex,
) {
  return Watched.query(connection)
    .allowGraph('[review, rating]')
    .insertGraph(watched);
}

export function upsertWatchedGraph(
  watched: Partial<Watched>,
  connection: Transaction | Knex = knex,
) {
  return Watched.query(connection)
    .allowGraph('[review, rating]')
    .upsertGraphAndFetch(watched);
}
