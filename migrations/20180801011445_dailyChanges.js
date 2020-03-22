exports.up = function (knex, Promise) {
  return knex.schema.createTable('DailyChanges', (table) => {
    table.increments('id').primary();
    table.string('type');
    table.integer('inserted');
    table.integer('updated');
    table.integer('deleted');
    table.bigInteger('createdAt').unsigned().notNullable();
    table.bigInteger('updatedAt').unsigned().notNullable();
  });
};

exports.down = function (knex, Promise) {
  return knex.schema.dropTableIfExists('DailyChanges');
};
