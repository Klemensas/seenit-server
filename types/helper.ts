import { Request as ExpressRequest } from 'express-serve-static-core';
import { User } from '../src/models/user';

export interface Dict<T = any> {
  [key: string]: T;
}

export interface Request<T = any> extends ExpressRequest {
  body: Record<string, T>;
  params: Record<string, string>;
  user?: Exclude<User, 'password' | 'salt'>;
}
