import * as Knex from 'knex';
import * as seedrandom from 'seedrandom';

import { Watched } from '../src/models/watched';
import { User } from '../src/models/user';
import { pickItem } from './util/helpers';

const rng = seedrandom('watched-seed');
export default (knex: Knex, users: User[], itemList: any[], iterationsPerUser = 10, chance = 0.4) => Watched.query(knex).del()
    .then(() => users.reduce((acc, { id }) => acc.concat(Array.from({ length: iterationsPerUser })
      .reduce((items: Watched[]) => {
        if (rng() <= chance) {
          const targetItem = pickItem(rng(), itemList);
          items.push({
            itemId: targetItem.id,
            itemType: targetItem.constructor.name,
            tmdbId: 1,
            userId: id,
          } as Watched);
        }
        return items;
      }, []),
    ), []))
    .then((watched) => Watched.query(knex).insert(watched))
;
