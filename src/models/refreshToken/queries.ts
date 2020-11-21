import * as Knex from 'knex';
import { Transaction } from 'objection';

import { knex } from '../../config';
import { RefreshToken } from './model';

export function getRefreshToken(
  token: string,
  connection: Transaction | Knex = knex,
) {
  return RefreshToken.query(connection).findOne({ token });
}

export function createRefreshToken(
  token: string,
  connection: Transaction | Knex = knex,
) {
  return RefreshToken.query(connection).insert({ token }).returning('*');
}

export function deleteRefreshToken(
  token: string,
  connection: Transaction | Knex = knex,
) {
  return getRefreshToken(token, connection).delete();
}
