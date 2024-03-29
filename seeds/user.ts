import { Knex } from 'knex';

import { User } from '../src/models/user/model';

export default (knex: Knex, userCount = 100, namePrefix = 'user') =>
  User.query(knex)
    .del()
    .then(() =>
      Array.from({ length: userCount }, (n, i) => ({
        name: `${namePrefix}-${i}`,
        email: `${namePrefix}-${i}@demo.com`,
        password: `test`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      })),
    )
    .then((users) => User.query(knex).insert(users));
