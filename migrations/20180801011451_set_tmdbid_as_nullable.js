exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable('Watched', (table) => {
      table.integer('tmdbId').nullable().alter();
      table.uuid('itemId').notNullable().alter();
    })
    .alterTable('Review', (table) => {
      table.integer('tmdbId').unsigned();
      table.uuid('itemId').notNullable().alter();
    })
    .alterTable('Rating', (table) => {
      table.integer('tmdbId').unsigned();
      table.uuid('itemId').notNullable().alter();
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable('Watched', (table) => {
      table.integer('tmdbId').notNullable().alter();
      table.uuid('itemId').nullable().alter();
    })
    .alterTable('Review', (table) => {
      table.dropColumn('tmdbId');
      table.uuid('itemId').nullable().alter();
    })
    .alterTable('Rating', (table) => {
      table.dropColumn('tmdbId');
      table.uuid('itemId').nullable().alter();
    })
};