exports.up = function(knex, Promise) {
  return knex.schema
    .createTable('Season', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.string('name');
      table.string('overview');
      table.bigInteger('air_date').unsigned().notNullable();
      table.integer('episode_count');
      table.string('poster_path');
      table.integer('season_number');
      table.integer('tmdbId').unsigned().notNullable();
      table
        .uuid('tvId')
        .references('id')
        .inTable('Tv')
        .onDelete('CASCADE');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    })
    .createTable('Episode', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.string('name');
      table.string('overview');
      table.integer('episode_number');
      table.bigInteger('air_date').unsigned().notNullable();
      table.string('production_code');
      table.string('still_path');
      table.integer('vote_average');
      table.integer('vote_count');
      table.integer('tmdbId').unsigned().notNullable();
      table
        .uuid('seasonId')
        .references('id')
        .inTable('Season')
        .onDelete('CASCADE');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    });
}

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('Episode')
    .dropTableIfExists('Season')
}
