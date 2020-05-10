import * as Knex from 'knex';
import { Transaction } from 'objection';

import { knex } from '../../config';
import { Season } from './model';

export function getSeason(
  where: Partial<Season>,
  connection: Transaction | Knex = knex,
) {
  return Season.query(connection).findOne(where);
}

export function getSeasonById(
  id: string,
  connection: Transaction | Knex = knex,
) {
  return Season.query(connection).findById(id);
}

export function getSeasonsByTvId(
  tvId: string,
  connection: Transaction | Knex = knex,
) {
  return Season.query(connection)
    .where({ tvId })
    .orderBy('season_number', 'ASC');
}

export function getSeasonWithEpisodes(
  where: Partial<Season>,
  connection: Transaction | Knex = knex,
) {
  return getSeason(where, connection).withGraphFetched('episodes');
}
