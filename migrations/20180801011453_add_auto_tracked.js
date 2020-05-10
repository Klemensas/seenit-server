exports.up = function (knex) {
  return knex.schema
    .createTable('AutoTracked', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.uuid('userId').references('id').inTable('User').onDelete('CASCADE');
      table
        .uuid('itemId')
      table
        .foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id']);
      table.enum('itemType', ['Movie', 'Tv']);
      table.enum('tvItemType', ['Season', 'Episode']);
      table
        .uuid('tvItemId')
      table
        .foreign('tvItemId')
        .onDelete('CASCADE')
        .references(['Season.id', 'Episode.id']);
      table.jsonb('meta');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    })
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('AutoTracked')
};