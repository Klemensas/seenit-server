exports.up = function (knex) {
  return knex.schema
    .alterTable('Watched', (table) => {
      table.dropColumn('tvData');
      table.dropColumn('itemType');
      table.enum('tvItemType', ['Season', 'Episode']);
      table.uuid('tvItemId');
      table
        .foreign('tvItemId')
        .onDelete('CASCADE')
        .references(['Season.id', 'Episode.id']);
      table
        .foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id']);
    })
    .alterTable('Watched', (table) => {
      table.enum('itemType', ['Movie', 'Tv']);
    })
    .alterTable('Review', (table) => {
      table.dropColumn('itemType');
      table.enum('tvItemType', ['Season', 'Episode']);
      table.uuid('tvItemId');
      table
        .foreign('tvItemId')
        .onDelete('CASCADE')
        .references(['Season.id', 'Episode.id']);
      table
        .foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id']);
    })
    .alterTable('Review', (table) => {
      table.enum('itemType', ['Movie', 'Tv']);
    })
    .alterTable('Rating', (table) => {
      table.dropColumn('itemType');
      table.enum('tvItemType', ['Season', 'Episode']);
      table.uuid('tvItemId');
      table
        .foreign('tvItemId')
        .onDelete('CASCADE')
        .references(['Season.id', 'Episode.id']);
      table
        .foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id']);
    })
    .alterTable('Rating', (table) => {
      table.enum('itemType', ['Movie', 'Tv']);
    });
};

exports.down = function (knex) {
  return knex.schema
    .alterTable('Watched', (table) => {
      table.jsonb('tvData');
      table.dropColumn('itemType');
      table.dropColumn('tvItemType');
      table.dropColumn('tvItemId');
      table
        .foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id', 'Season.id', 'Episode.id'])
        .alter();
    })
    .alterTable('Watched', (table) => {
      table.enum('itemType', ['Movie', 'Tv', 'Season', 'Episode']);
    })
    .alterTable('Review', (table) => {
      table.dropColumn('itemType');
      table.enum('itemType', ['Movie', 'Tv', 'Season', 'Episode']).alter();
      table.dropColumn('tvItemType');
      table.dropColumn('tvItemId');
      table
        .foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id', 'Season.id', 'Episode.id'])
        .alter();
    })
    .alterTable('Review', (table) => {
      table.enum('itemType', ['Movie', 'Tv', 'Season', 'Episode']);
    })
    .alterTable('Rating', (table) => {
      table.dropColumn('itemType');
      table.enum('itemType', ['Movie', 'Tv', 'Season', 'Episode']).alter();
      table.dropColumn('tvItemType');
      table.dropColumn('tvItemId');
      table
        .foreign('itemId')
        .onDelete('CASCADE')
        .references(['Movie.id', 'Tv.id', 'Season.id', 'Episode.id'])
        .alter();
    })
    .alterTable('Rating', (table) => {
      table.enum('itemType', ['Movie', 'Tv', 'Season', 'Episode']);
    });
};