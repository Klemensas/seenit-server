import * as Knex from 'knex';
import * as seedrandom from 'seedrandom';

import { Review } from '../src/models/review';
import { User } from '../src/models/user';
import { pickItem, generatePlaceholder } from './util/helpers';
import { Dict } from '../types/helper';
import { Watched } from '../src/models/watched';

const rng = seedrandom('review-seed');
export default (
  knex: Knex,
  users: User[],
  userWatched: Dict<Watched[]>,
  itemList: any[],
  iterationsPerUser = 10,
  chance = 0.4,
  watchedChance = 0.75,
) => Review.query(knex).del()
  .then(() => users.reduce((acc, { id }) => acc.concat(Array.from({ length: iterationsPerUser })
    .reduce((items: Review[], i) => {
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
        body: generatePlaceholder.text(rng),
      } as Review];
    }, []),
  ), []))
  .then((reviews) => Review.query(knex).insert(reviews))
;
