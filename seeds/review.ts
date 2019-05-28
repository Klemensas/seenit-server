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
      let tvData = null;
      const watchedRng = rng();
      if (watchedRng <= watchedChance) {
        watched = pickItem(watchedRng, userWatched[id]) || null;
        if (watched) {
          tvData = watched.tvData;
        }
      }

      const targetItem = watched || pickItem(rng(), itemList);
      if (!watched && targetItem.seasons) {
        const seasonData = pickItem(rng(), targetItem.seasons);
        const season = seasonData.season_number;
        const episode = Math.floor(seasonData.episode_count * rng()) + 1;
        tvData = {
          season,
          episode,
        };
      }

      return [...items, {
        watchedId: watched ? watched.id : undefined,
        tmdbId: watched ? watched.tmdbId : pickItem(rng(), itemList).tmdbId,
        userId: id,
        body: generatePlaceholder.text(rng),
        itemId: targetItem.itemId || targetItem.id,
        itemType: targetItem.itemType || targetItem.constructor.name,
        tvData,
      } as Review];
    }, []),
  ), []))
  .then((reviews) => Review.query(knex).insert(reviews))
;
