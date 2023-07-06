
exports.up = function(knex) {
  return knex.schema
    .alterTable('Tv', (table) => {
      table.boolean('adult');
    })
};

exports.down = function(knex) {
  return knex.schema
    .alterTable('Tv', (table) => {
      table.dropColumn('adult');
    })
};
