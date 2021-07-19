import { Knex } from 'knex';
import { Transaction } from 'objection';

import { knex } from '../../config';
import { Episode } from './model';

export function getEpisode(
  where: Partial<Episode>,
  connection: Transaction | Knex = knex,
) {
  return Episode.query(connection).findOne(where);
}

export function getEpisodeById(
  id: string,
  connection: Transaction | Knex = knex,
) {
  return Episode.query(connection).findById(id);
}

export function getEpisodesBySeasonId(
  seasonId: string,
  connection: Transaction | Knex = knex,
) {
  return Episode.query(connection)
    .where({ seasonId })
    .orderBy('episode_number', 'ASC');
}
