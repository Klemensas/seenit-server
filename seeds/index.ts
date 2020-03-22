import { knex } from '../src/config';
import userSeed from './user';
import movieSeed from './movie';
import tvSeed from './tv';
import watchedSeed from './watched';

/* tslint:disable:no-console */
(async () => {
  console.log('Seeding in progress, this might take a while, please wait');
  console.time('seed');
  try {
    const [users, movies, tvs] = await Promise.all([
      userSeed(knex),
      movieSeed(knex),
      tvSeed(knex),
    ]);
    const itemList = [...movies, ...tvs];
    const watched = await watchedSeed(knex, users, itemList);
    const userWatched = users.reduce((acc, { id }) => {
      acc[id] = watched.filter(({ userId }) => userId === id);
      return acc;
    }, {});
    // await Promise.all([
    //   reviewSeed(knex, users, userWatched, itemList),
    //   ratingSeed(knex, users, userWatched, itemList),
    // ]);

    console.timeEnd('seed');
    console.log('seeding completed successfully');
    process.exit(0);
  } catch (err) {
    console.timeEnd('seed');
    console.log('failed seeding, might need to rllback', err);
    process.exit(1);
  }
})();
