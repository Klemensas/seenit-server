exports.up = function(knex, Promise) {
  return knex.schema
    .alterTable('Movie', (table) => {
      table.text('tagline').alter()
    });

}

exports.down = function(knex, Promise) {
  return knex.schema
    .alterTable('Movie', (table) => {
      table.string('tagline').alter()
    })
}
