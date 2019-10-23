exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable('Episode', (table) => {
      table.index(['seasonId'], 'seasonIdIndex', 'HASH');
    })
    .alterTable('Season', (table) => {
      table.index(['tvId'], 'tvIdIndex', 'HASH');
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable('Episode', (table) => {
      table.dropIndex(['seasonId'], 'seasonIdIndex');
    })
    .alterTable('Season', (table) => {
      table.dropIndex(['tvId'], 'tvIdIndex');
    })
};