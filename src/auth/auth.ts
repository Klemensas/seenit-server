import * as passport from 'passport';
import * as jwt from 'jsonwebtoken';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import { Strategy as CookieStrategy } from 'passport-cookie';
import * as bcrypt from 'bcrypt';

import { getUserById, getFullUser } from '../models/user/queries';
import { User } from '../models/user/model';
import { config } from '../config';
import { AuthError } from '../errors/authError';
import {
  getRefreshToken,
  createRefreshToken,
} from '../models/refreshToken/queries';
import { Response } from 'express';

export class Auth {
  static async comparePasswords(
    pass1: string | undefined,
    pass2: string | undefined,
  ) {
    if (!pass1 || !pass2) {
      return false;
    }

    return bcrypt.compare(pass1, pass2);
  }

  static signToken(
    { id, email }: Pick<User, 'id' | 'email'>,
    isRefreshToken = false,
  ) {
    return jwt.sign(
      {
        id,
        email,
      },
      config.secrets.session,
      {
        expiresIn: isRefreshToken
          ? config.session.refreshSeconds
          : config.session.jwtSeconds,
      },
    );
  }

  static isAuthenticated() {
    return passport.authenticate('bearer', {
      session: false,
      failWithError: false,
    });
  }

  static hasRefreshToken() {
    return passport.authenticate('cookie', {
      session: false,
    });
  }

  static async createTokens(
    { id, email }: Pick<User, 'id' | 'email'>,
    res: Response,
  ) {
    const token = Auth.signToken({ id, email });
    const refreshToken = Auth.signToken({ id, email }, true);
    await createRefreshToken(refreshToken);

    res.cookie('token', token, {
      path: '/auth',
      signed: true,
      httpOnly: true,
      // maxAge: 10000,
    });

    return { token, refreshToken };
  }

  static async getUserFromToken(token: string) {
    const tokenData = jwt.verify(token, config.secrets.session) as any;
    const user = await getUserById(tokenData.id);
    return user;
  }

  static useLocalStrategy() {
    passport.use(
      new LocalStrategy(
        {
          usernameField: 'email',
          passwordField: 'password',
        },
        async (email, password, done) => {
          const user = await getFullUser({ email });
          if (!user) {
            return done('User not found', false);
          }

          const authorized = await this.comparePasswords(
            password,
            user.password,
          );
          const cleanUser = { ...user };
          delete cleanUser.password;
          delete cleanUser.salt;
          return authorized ? done(null, cleanUser) : done(null, false);
        },
      ),
    );
  }

  static useBearerStrategy() {
    passport.use(
      new BearerStrategy((token, done) =>
        this.getUserFromToken(token)
          .then((user) => done(null, user))
          .catch((error) => done(new AuthError(error.message), false)),
      ),
    );
  }

  static useCookieStrategy() {
    passport.use(
      new CookieStrategy({ signed: true }, async (token, done) => {
        try {
          const storedToken = await getRefreshToken(token);
          const user = await this.getUserFromToken(storedToken.token);

          return done(null, user);
        } catch (error) {
          console.error('ohohoho', error);
          done(new AuthError(error.message), false);
        }
      }),
    );
  }
}
