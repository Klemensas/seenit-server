import { Knex } from 'knex';

import movieList from './util/movieList';
import { Movie } from '../src/models/movie/model';

export default (knex: Knex, list = movieList) =>
  Movie.query(knex)
    .del()
    .then(() =>
      Movie.query(knex).insert(
        list.map(({ id, ...item }: any) => ({
          ...item,
          tmdbId: id,
        })),
      ),
    );
