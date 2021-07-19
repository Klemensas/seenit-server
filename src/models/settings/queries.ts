import { Knex } from 'knex';
import { Transaction } from 'objection';

import { knex } from '../../config';
import { Settings } from './model';

export function getSettings(
  userId: number | string,
  connection: Transaction | Knex = knex,
) {
  return Settings.query(connection).findOne({ userId });
}

export function updateSettings(
  settings: Settings,
  userId: number | string,
  connection: Transaction | Knex = knex,
) {
  return Settings.query(connection)
    .update(settings)
    .where({ userId })
    .first()
    .returning('*');
}

export function patchSettings(
  settings: Partial<Settings>,
  userId: number | string,
  connection: Transaction | Knex = knex,
) {
  return Settings.query(connection)
    .patch(settings)
    .where({ userId })
    .first()
    .returning('*');
}
