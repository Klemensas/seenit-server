const config = require('./src/config/environment'); 

module.exports = {
  client: 'pg',
  connection: config.knex.connection,
};