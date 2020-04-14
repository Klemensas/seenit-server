exports.up = function (knex) {
  return knex.schema
    .alterTable('Movie', (table) => {
      table.specificType('titleVector', 'tsvector');
      table.index('titleVector', null, 'gin');
    })
    .alterTable('Tv', (table) => {
      table.specificType('titleVector', 'tsvector');
      table.index('titleVector', null, 'gin');
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('Movie', (table) => {
      table.dropColumn('titleVector');
    })
    .alterTable('Tv', (table) => {
      table.dropColumn('titleVector');
    });
};