
exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('User', (table) => {
      table.increments('id').primary();
      table.string('name').unique();
      table.string('email').unique();
      table.string('password').notNullable();
      table.string('salt').notNullable();
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('User');
};
