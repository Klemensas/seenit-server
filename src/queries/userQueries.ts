import * as Knex from 'knex';
import { Transaction } from 'objection';

import { knex } from '../config';
import { User } from '../models/user';

export function getUserById(id: number, connection: Transaction | Knex = knex) {
  return User
    .query(connection)
    .findById(id)
    .select('id', 'name', 'email', 'createdAt', 'updatedAt');
}

export function getUser(where: Partial<User>, connection: Transaction | Knex = knex) {
  return getFullUser(where, connection)
    .select('id', 'name', 'email', 'createdAt', 'updatedAt');
}

export function getFullUser(where: Partial<User>, connection: Transaction | Knex = knex) {
  return User
    .query(connection)
    .findOne(where);
}

export function getUsers(where: Partial<User>, connection: Transaction | Knex = knex) {
  return User
    .query(connection)
    .where(where);
}

export function createUser(user: Partial<User>, connection: Transaction | Knex = knex) {
  return User
    .query(connection)
    .insert(user);
}
