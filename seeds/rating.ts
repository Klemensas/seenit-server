import * as Knex from 'knex';
import * as seedrandom from 'seedrandom';

import { Rating, maxRatingValue } from '../src/models/rating';
import { User } from '../src/models/user';
import { pickItem } from './util/helpers';
import { Dict } from '../types/helper';
import { Watched } from '../src/models/watched';

const rng = seedrandom('rating-seed');
export default (
  knex: Knex,
  users: User[],
  userWatched: Dict<Watched[]>,
  itemList: any[],
  iterationsPerUser = 10,
  chance = 0.4,
  watchedChance = 0.75,
) => Rating.query(knex).del()
  .then(() => users.reduce((acc, { id }) => acc.concat(Array.from({ length: iterationsPerUser })
    .reduce((items: Rating[], i) => {
      if (rng() > chance) { return items; }

      let watched = null;
      const watchedRng = rng();
      if (watchedRng <= watchedChance) {
        watched = pickItem(watchedRng, userWatched[id]) || null;
      }
      return [...items, {
        watchedId: watched ? watched.id : undefined,
        tmdbId: watched ? watched.tmdbId : pickItem(rng(), itemList).tmdbId,
        userId: id,
        value: Math.round(rng() * maxRatingValue),
      } as Rating];
    }, []),
  ), []))
  .then((ratings) => Rating.query(knex).insert(ratings))
;
