exports.up = function (knex) {
  return knex.schema
    .createTable('Settings', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.uuid('userId').references('id').inTable('User').onDelete('CASCADE');
      table.jsonb('general');
      table.jsonb('extension');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    })
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('Settings')
};