// TODO: Disabled for knex migration runner support, investigate possibility to reenable
// eslint-disable-next-line @typescript-eslint/no-var-requires
const config = require('./src/config/environment');

module.exports = {
  client: 'postgresql',
  connection: config.dbConnection,
};