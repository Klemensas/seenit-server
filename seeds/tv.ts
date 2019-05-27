import * as Knex from 'knex';

import tvList from './util/tvList';
import { Tv } from '../src/models/tv';

export default (knex: Knex, list = tvList) => Tv.query(knex).del()
  .then(() => Tv.query(knex).insert(
    list.map(({ id, ...item }: any) => ({
      ...item,
      tmdbId: id,
    })),
  ));
