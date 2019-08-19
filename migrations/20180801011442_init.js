
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
    .createTable('Movie', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.boolean('adult');
      table.string('backdrop_path');
      table.jsonb('belongs_to_collection');
      table.bigInteger('budget').unsigned();
      table.specificType('genres', 'jsonb[]');
      table.string('homepage');
      table.string('imdb_id');
      table.string('original_language');
      table.string('original_title');
      table.text('overview');
      table.float('popularity');
      table.string('poster_path');
      table.specificType('production_companies', 'jsonb[]');
      table.specificType('production_countries', 'jsonb[]');
      table.string('release_date');
      table.bigInteger('revenue').unsigned();
      table.integer('runtime').unsigned();
      table.specificType('spoken_languages', 'jsonb[]');
      table.string('status');
      table.string('tagline');
      table.string('title');
      table.boolean('video');
      table.float('vote_average');
      table.integer('vote_count').unsigned();
      table.integer('tmdbId').unsigned().notNullable();
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    })
    .createTable('Tv', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.string('backdrop_path');
      table.specificType('created_by', 'jsonb[]');
      table.specificType('episode_run_time', 'integer[]');
      table.string('first_air_date');
      table.specificType('genres', 'jsonb[]');
      table.string('homepage');
      table.boolean('in_production');
      table.specificType('languages', 'text[]');
      table.string('last_air_date');
      table.jsonb('last_episode_to_air');
      table.string('name');
      table.jsonb('next_episode_to_air');
      table.specificType('networks', 'jsonb[]');
      table.integer('number_of_episodes').unsigned();
      table.integer('number_of_seasons').unsigned();
      table.specificType('origin_country', 'text[]');
      table.string('original_language');
      table.string('original_name');
      table.text('overview');
      table.float('popularity');
      table.string('poster_path');
      table.specificType('production_companies', 'jsonb[]');
      table.specificType('seasons', 'jsonb[]');
      table.string('status');
      table.string('type');
      table.float('vote_average');
      table.integer('vote_count').unsigned();
      table.integer('tmdbId').unsigned().notNullable();
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    })
    .createTable('Watched', (table) => {
      table.increments('id').primary();
      table.integer('tmdbId').unsigned().notNullable();
      table.jsonb('tvData');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
      table
        .integer('userId')
        .unsigned()
        .references('id')
        .inTable('User')
        .onDelete('CASCADE');
      table.uuid('itemId');
      table.foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id']);
      table.enum('itemType', ['Movie', 'Tv']);
    })
    .createTable('Rating', (table) => {
      table.increments('id').primary();
      table.float('value').notNullable();
      table.string('symbol');
      table.integer('tmdbId').unsigned().notNullable();
      table.jsonb('tvData');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
      table
        .integer('userId')
        .unsigned()
        .references('id')
        .inTable('User')
        .onDelete('CASCADE');
      table
        .integer('watchedId')
        .unsigned()
        .references('id')
        .inTable('Watched')
        .onDelete('CASCADE');
      table.uuid('itemId');
      table.foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id']);
      table.enum('itemType', ['Movie', 'Tv']);
    })
    .createTable('Review', (table) => {
      table.increments('id').primary();
      table.text('body').notNullable;
      table.integer('tmdbId').unsigned().notNullable();
      table.jsonb('tvData');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
      table
        .integer('userId')
        .unsigned()
        .references('id')
        .inTable('User')
        .onDelete('CASCADE');
      table
        .integer('watchedId')
        .unsigned()
        .references('id')
        .inTable('Watched')
        .onDelete('CASCADE');
      table.uuid('itemId');
      table.foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id']);
      table.enum('itemType', ['Movie', 'Tv']);
    })
};

exports.down = function(knex, Promise) {
  return knex.schema
    .dropTableIfExists('Movie')
    .dropTableIfExists('Tv')
    .dropTableIfExists('Review')
    .dropTableIfExists('Rating')
    .dropTableIfExists('Watched')
    .dropTableIfExists('User')
};
