import { Knex } from 'knex';
import { Transaction, QueryBuilder } from 'objection';

import { knex } from '../config';
import { searchResults } from '../config/constants';
import { Movie } from './movie/model';
import { Tv } from './tv/model';
import { ItemTypes } from '../util/watchedItemHelper';

// General queries spanning multiple models
// TODO: figure out a better structure for this
export type SearchResult = Pick<
  Movie,
  'id' | 'tmdbId' | 'title' | 'release_date' | 'popularity'
> & {
  score: number;
  type: ItemTypes;
};

export function searchContent(
  { title, releaseYear }: { title: string; releaseYear?: string },
  limit = searchResults,
  types: Array<'movie' | 'tv'> = ['movie', 'tv'],
  connection: Transaction | Knex = knex,
): Promise<Array<SearchResult>> {
  const baseTitle = title
    .slice(0, 100)
    .toLowerCase()
    .replace(/[^\w\d\s]/g, '')
    .trim()
    .replace(/\s/g, ' & ');

  if (!baseTitle.length) return Promise.resolve([]);

  const formattedTitle = baseTitle + ':*';

  let movieQuery = Movie.query(connection)
    .select(
      'id',
      'tmdbId',
      'title',
      'release_date',
      'popularity',
      'poster_path',
      knex.raw(`'${ItemTypes.Movie}' as type`),
      knex.raw(
        `ts_rank_cd("titleVector", to_tsquery('english_nostop', ?), 4) as score`,
        [formattedTitle],
      ),
    )
    .where(
      knex.raw(`"titleVector" @@ to_tsquery('english_nostop', ?)`, [
        formattedTitle,
      ]),
    )
    .andWhere('release_date', 'like', `%${releaseYear}%`);

  let tvQuery = Tv.query(connection)
    .select(
      'id',
      'tmdbId',
      'name as title',
      'first_air_date as release_date',
      'popularity',
      'poster_path',
      knex.raw(`'${ItemTypes.Tv}' as type`),
      knex.raw(
        `ts_rank_cd("titleVector", to_tsquery('english_nostop', ?), 4) as score`,
        [formattedTitle],
      ),
    )
    .where(
      knex.raw(`"titleVector" @@ to_tsquery('english_nostop', ?)`, [
        formattedTitle,
      ]),
    );

  if (releaseYear) {
    movieQuery = movieQuery.andWhere(
      'release_date',
      'like',
      `%${releaseYear}%`,
    );
    tvQuery = tvQuery.andWhere('first_air_date', 'like', `%${releaseYear}%`);
  }

  let baseQuery: QueryBuilder<Movie | Tv>;
  if (types.length === 1) {
    baseQuery = types[0] === 'movie' ? movieQuery : tvQuery;
  } else {
    baseQuery = movieQuery.unionAll([tvQuery]);
  }

  return baseQuery
    .orderBy([
      { column: 'score', order: 'desc' },
      { column: 'popularity', order: 'desc' },
    ])
    .limit(limit) as any;
}
