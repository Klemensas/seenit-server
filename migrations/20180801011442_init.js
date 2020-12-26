exports.up = function (knex) {
  return knex.schema
    .raw(`
      CREATE TEXT SEARCH DICTIONARY english_stem_nostop (
        Template = snowball,
        Language = english
      )
    `)
    .raw(`
      CREATE TEXT SEARCH CONFIGURATION public.english_nostop ( COPY = pg_catalog.english );
      ALTER TEXT SEARCH CONFIGURATION public.english_nostop
      ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, hword, hword_part, word WITH english_stem_nostop;
    `)
    .createTable('User', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
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
      table.text('homepage');
      table.string('imdb_id');
      table.string('original_language');
      table.text('original_title');
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
      table.text('tagline');
      table.text('title');
      table.boolean('video');
      table.float('vote_average');
      table.bigInteger('vote_count').unsigned();
      table.integer('tmdbId').unsigned().notNullable();
      table.specificType('titleVector', 'tsvector');
      table.index('titleVector', null, 'gin');
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
      table.text('homepage');
      table.boolean('in_production');
      table.specificType('languages', 'text[]');
      table.string('last_air_date');
      table.jsonb('last_episode_to_air');
      table.text('name');
      table.jsonb('next_episode_to_air');
      table.specificType('networks', 'jsonb[]');
      table.integer('number_of_episodes').unsigned();
      table.integer('number_of_seasons').unsigned();
      table.specificType('origin_country', 'text[]');
      table.string('original_language');
      table.text('original_name');
      table.text('overview');
      table.float('popularity');
      table.string('poster_path');
      table.specificType('production_companies', 'jsonb[]');
      table.specificType('production_countries', 'jsonb[]');
      table.specificType('spoken_languages', 'jsonb[]');
      table.string('status');
      table.text('tagline');
      table.string('type');
      table.float('vote_average');
      table.bigInteger('vote_count').unsigned();
      table.integer('tmdbId').unsigned().notNullable();
      table.specificType('titleVector', 'tsvector');
      table.index('titleVector', null, 'gin');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    })
    .createTable('Watched', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.integer('tmdbId').unsigned();
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
      table
        .uuid('userId')
        .references('id')
        .inTable('User')
        .onDelete('CASCADE');
      table.uuid('itemId').notNullable();
      table
        .foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id'])
      table.uuid('tvItemId');
      table
        .foreign('tvItemId')
        .onDelete('CASCADE')
        .references(['Season.id', 'Episode.id']);
      table.enum('itemType', ['Movie', 'Tv']);
      table.enum('tvItemType', ['Season', 'Episode']);
    })
    .createTable('Rating', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.float('value').notNullable();
      table.string('symbol');
      table.integer('tmdbId').unsigned();
      table.jsonb('tvData');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
      table
        .uuid('userId')
        .references('id')
        .inTable('User')
        .onDelete('CASCADE');
      table
        .uuid('watchedId')
        .references('id')
        .inTable('Watched')
        .onDelete('CASCADE');
      table.uuid('itemId').notNullable();
      table
        .foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id']);
      table.enum('itemType', ['Movie', 'Tv']);
      table.enum('tvItemType', ['Season', 'Episode']);
      table.uuid('tvItemId');
      table
        .foreign('tvItemId')
        .onDelete('CASCADE')
        .references(['Season.id', 'Episode.id']);
    })
    .createTable('Review', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.text('body').notNullable;
      table.integer('tmdbId').unsigned();
      table.jsonb('tvData');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
      table
        .uuid('userId')
        .references('id')
        .inTable('User')
        .onDelete('CASCADE');
      table
        .uuid('watchedId')
        .references('id')
        .inTable('Watched')
        .onDelete('CASCADE');
      table.uuid('itemId').notNullable();
      table
        .foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id']);
      table.enum('itemType', ['Movie', 'Tv']);
      table.enum('tvItemType', ['Season', 'Episode']);
      table.uuid('tvItemId');
      table
        .foreign('tvItemId')
        .onDelete('CASCADE')
        .references(['Season.id', 'Episode.id']);
    })
    .createTable('DailyChanges', (table) => {
      table.increments('id').primary();
      table.string('type');
      table.integer('batch');
      table.specificType('changes', 'jsonb');
      table.integer('tmdbId');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    })
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
      table.index(['tvId'], 'tvIdIndex', 'HASH');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    })
    .createTable('Episode', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.text('name');
      table.text('overview');
      table.bigInteger('episode_number');
      table.bigInteger('air_date').unsigned();
      table.string('production_code');
      table.string('still_path');
      table.float('vote_average');
      table.bigInteger('vote_count');
      table.specificType('crew', 'jsonb[]');
      table.specificType('guest_stars', 'jsonb[]');
      table.integer('tmdbId').unsigned().notNullable();
      table
        .uuid('seasonId')
        .references('id')
        .inTable('Season')
        .onDelete('CASCADE');
      table.index(['seasonId'], 'seasonIdIndex', 'HASH');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    })
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
    .createTable('Settings', (table) => {
      table.uuid('id').defaultTo(knex.raw('uuid_generate_v4()')).primary();
      table.uuid('userId').references('User.id').onDelete('CASCADE');
      table.jsonb('general');
      table.jsonb('extension');
      table.bigInteger('createdAt').unsigned().notNullable();
      table.bigInteger('updatedAt').unsigned().notNullable();
    })
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('Movie')
    .dropTableIfExists('Episode')
    .dropTableIfExists('Season')
    .dropTableIfExists('Tv')
    .dropTableIfExists('Review')
    .dropTableIfExists('Rating')
    .dropTableIfExists('Watched')
    .dropTableIfExists('Settings')
    .dropTableIfExists('AutoTracked')
    .dropTableIfExists('User')
    .dropTableIfExists('DailyChanges')
    .raw(`
      DROP TEXT SEARCH DICTIONARY english_stem_nostop CASCADE
    `)
};