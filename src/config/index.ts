import * as Knex from 'knex';
import { Model } from 'objection';

import * as envConfig from './environment';

Model.knex(
  Knex({ ...envConfig.knex.options, connection: envConfig.dbConnection }),
);
export const knex = Model.knex();

export const config = {
  ...envConfig,
  knex,
};
