const config = require('./src/config/environment');

module.exports = {
  client: 'postgresql',
  connection: config.dbConnection,
};
