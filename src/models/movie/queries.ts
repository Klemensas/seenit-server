import * as Knex from 'knex';
import { Transaction } from 'objection';

import { knex } from '../../config';
import { Movie } from './model';

export function getMovieById(
  id: string,
  connection: Transaction | Knex = knex,
) {
  return Movie.query(connection).findById(id);
}

export function getMovieByTmdbId(
  tmdbId: number,
  connection: Transaction | Knex = knex,
) {
  return Movie.query(connection).findOne({ tmdbId });
}

export function getMovie(
  where: Partial<Movie>,
  connection: Transaction | Knex = knex,
) {
  return Movie.query(connection).where(where);
}

export function getMovieByWatched(
  watchedId: number,
  connection: Transaction | Knex = knex,
) {
  return Movie.query(connection).findOne({ watchedId });
}

export function create(
  movie: Partial<Movie>,
  connection: Transaction | Knex = knex,
) {
  return Movie.query(connection).insert(movie);
}
