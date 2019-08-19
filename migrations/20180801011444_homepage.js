exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable('Movie', (table) => {
      table.text('homepage').alter()
    })
    .alterTable('Tv', (table) => {
      table.text('homepage').alter()
    })
}

exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable('Movie', (table) => {
      table.string('homepage').alter()
    })
    .alterTable('Tv', (table) => {
      table.string('homepage').alter()
    })
}
