import * as Knex from 'knex';
import { Transaction } from 'objection';

import { knex } from '../../config';
import { AutoTracked } from './model';
import { perPage } from '../../config/constants';

export function getAutoTrackedById(
  id: string,
  connection: Transaction | Knex = knex,
) {
  return AutoTracked.query(connection).findById(id);
}

export function createAutoTracked(
  autoTracked: Partial<AutoTracked>,
  connection: Transaction | Knex = knex,
) {
  return AutoTracked.query(connection).insert(autoTracked);
}

export function getPaginatedAutoTracked(
  where: Partial<AutoTracked>,
  pagination: { count: number; after: string | number } = {
    count: perPage,
    after: Date.now(),
  },
  connection: Transaction | Knex = knex,
) {
  return AutoTracked.query(connection)
    .where(where)
    .orderBy('AutoTracked.createdAt', 'DESC')
    .where('AutoTracked.createdAt', '<', pagination.after)
    .page(0, pagination.count);
}
