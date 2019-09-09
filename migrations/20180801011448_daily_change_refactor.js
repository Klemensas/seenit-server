exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable('DailyChanges', (table) => {
      table.integer('batch');
      table.specificType('changes', 'jsonb');
      table.integer('tmdbId');
      table.dropColumn('inserted');
      table.dropColumn('updated');
      table.dropColumn('deleted');
    });
}

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('DailyChanges')
}
