import * as passport from 'passport';
import * as jwt from 'jsonwebtoken';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as BearerStrategy } from 'passport-http-bearer';
import * as bcrypt from 'bcrypt';
import { GraphQLLocalStrategy } from 'graphql-passport';

import { getUserById, getFullUser } from '../models/user/queries';
import { User } from '../models/user/model';
import { config } from '../config';
import { AuthError } from '../errors/authError';

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

  static signToken({ id, email }: User) {
    return jwt.sign(
      {
        id,
        email,
      },
      config.secrets.session,
      {
        expiresIn: config.sessionLength,
      },
    );
  }

  static isAuthenticated() {
    return passport.authenticate('bearer', {
      session: false,
      failWithError: false,
    });
  }

  static async getUserFromToken(token: string) {
    const tokenData = jwt.verify(token, config.secrets.session) as any;
    const user = await getUserById(tokenData.id);
    return user;
  }

  static init() {
    passport.serializeUser((user: User, done) => {
      console.error('usssr');
      done(null, user.id);
    });

    passport.deserializeUser(async (id: string, done) => {
      console.error('usssr', id);
      const user = await getUserById(id);
      done(null, user);
    });

    // this.useLocalStrategy();
    this.useGraphQLLocalStrategy();
    this.useBearerStrategy();
  }

  /**
   * LocalStrategy
   *
   * This strategy is used to authenticate users based on a username and password.
   * Anytime a request is made to authorize an application, we must ensure that
   * a user is logged in before asking them to approve the request.
   */
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

  /**
   * BearerStrategy
   *
   * This strategy is used to authenticate users based on an access token (aka a
   * bearer token).  The user must have previously authorized a client
   * application, which is issued an access token to make requests on behalf of
   * the authorizing user.
   */
  static useBearerStrategy() {
    passport.use(
      new BearerStrategy((token, done) =>
        this.getUserFromToken(token)
          .then((user) => done(null, user))
          .catch((error) => done(new AuthError(error.message), false)),
      ),
    );
  }

  static useGraphQLLocalStrategy() {
    passport.use(
      new GraphQLLocalStrategy(async (email, password, done) => {
        const user = await getFullUser({ email });

        if (!user) {
          return done('User not found', false);
        }

        const authorized = await this.comparePasswords(password, user.password);

        if (!authorized) {
          return done('User not found', false);
        }

        const cleanUser = { ...user };
        delete cleanUser.password;
        delete cleanUser.salt;

        return done(null, cleanUser);
      }),
    );
  }
}
