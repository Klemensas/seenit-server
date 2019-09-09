import * as Knex from 'knex';
import { Transaction } from 'objection';

import { knex } from '../config';
import { Season } from '../models/season';

export function getSeasonById(id: string, connection: Transaction | Knex = knex) {
  return Season
    .query(connection)
    .findById(id);
}

export function getSeasonsByTvId(tvId: string, connection: Transaction | Knex = knex) {
  return Season
    .query(connection)
    .where({ tvId: '911a822d-aee5-4639-8caa-32ef090b6559' });
}
