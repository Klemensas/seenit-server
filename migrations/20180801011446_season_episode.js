exports.up = function (knex) {
  return knex.schema
    .createTable('Season', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.text('name');
      table.text('overview');
      table.bigInteger('air_date').unsigned();
      table.integer('episode_count');
      table.string('poster_path');
      table.integer('season_number');
      table.integer('tmdbId').unsigned().notNullable();
      table.uuid('tvId').references('id').inTable('Tv').onDelete('CASCADE');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    })
    .createTable('Episode', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.text('name');
      table.text('overview');
      table.integer('episode_number');
      table.bigInteger('air_date').unsigned();
      table.string('production_code');
      table.string('still_path');
      table.float('vote_average');
      table.integer('vote_count');
      table.specificType('crew', 'jsonb[]');
      table.specificType('guest_stars', 'jsonb[]');
      table.integer('tmdbId').unsigned().notNullable();
      table
        .uuid('seasonId')
        .references('id')
        .inTable('Season')
        .onDelete('CASCADE');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('Episode').dropTableIfExists('Season');
};