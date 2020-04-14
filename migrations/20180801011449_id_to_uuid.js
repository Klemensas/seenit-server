exports.up = function (knex) {
  return knex.schema
    .alterTable('Rating', (table) => {
      table.dropColumn('id');
      table.dropColumn('tmdbId');
      table.dropColumn('tvData');
      table.dropColumn('userId');
      table.dropColumn('watchedId');
      table.dropColumn('itemId');
      table.dropColumn('itemType');
    })
    .alterTable('Review', (table) => {
      table.dropColumn('id');
      table.dropColumn('tmdbId');
      table.dropColumn('tvData');
      table.dropColumn('userId');
      table.dropColumn('watchedId');
      table.dropColumn('itemId');
      table.dropColumn('itemType');
    })
    .alterTable('Watched', (table) => {
      table.dropColumn('id');
      table.dropColumn('userId');
      table.dropColumn('itemId');
      table.dropColumn('itemType');
    })
    .alterTable('User', (table) => {
      table.dropColumn('id');
    })
    .alterTable('User', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
    })
    .alterTable('Watched', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.uuid('userId').references('id').inTable('User').onDelete('CASCADE');
      table
        .foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id', 'Season.id', 'Episode.id']);
      table.enum('itemType', ['Movie', 'Tv', 'Season', 'Episode']);
    })
    .alterTable('Rating', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.uuid('userId').references('id').inTable('User').onDelete('CASCADE');
      table
        .uuid('watchedId')
        .references('id')
        .inTable('Watched')
        .onDelete('CASCADE');
      table.uuid('itemId');
      table
        .foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id', 'Season.id', 'Episode.id']);
      table.enum('itemType', ['Movie', 'Tv', 'Season', 'Episode']);
    })
    .alterTable('Review', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.uuid('userId').references('id').inTable('User').onDelete('CASCADE');
      table
        .uuid('watchedId')
        .references('id')
        .inTable('Watched')
        .onDelete('CASCADE');
      table.uuid('itemId');
      table
        .foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id', 'Season.id', 'Episode.id']);
      table.enum('itemType', ['Movie', 'Tv', 'Season', 'Episode']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('Movie')
    .dropTableIfExists('Tv')
    .dropTableIfExists('Review')
    .dropTableIfExists('Rating')
    .dropTableIfExists('Watched')
    .dropTableIfExists('User');
};