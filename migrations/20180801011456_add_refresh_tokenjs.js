exports.up = function (knex) {
  return knex.schema
    .createTable('RefreshToken', (table) => {
      table.string('token').primary().unique().notNullable();
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    })
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('RefreshToken')
};