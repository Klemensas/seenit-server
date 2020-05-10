exports.up = function (knex) {
  return knex.schema
    .raw(`
      CREATE TEXT SEARCH DICTIONARY english_stem_nostop (
        Template = snowball,
        Language = english
      );
    `)
    .raw(`
      CREATE TEXT SEARCH CONFIGURATION public.english_nostop ( COPY = pg_catalog.english );
      ALTER TEXT SEARCH CONFIGURATION public.english_nostop
      ALTER MAPPING FOR asciiword, asciihword, hword_asciipart, hword, hword_part, word WITH english_stem_nostop;
    `)
    .raw(`
      UPDATE "Tv" set "titleVector" = to_tsvector('english_nostop', name);
      UPDATE "Movie" set "titleVector" = to_tsvector('english_nostop', title);
    `)
}

exports.down = function (knex) {
  return knex.schema
    .raw(`
      DROP TEXT SEARCH DICTIONARY english_stem_nostop CASCADE
    `)
    .raw(`
      UPDATE "Tv" set "titleVector" = to_tsvector(name);
      UPDATE "Movie" set "titleVector" = to_tsvector(title);
    `)
};