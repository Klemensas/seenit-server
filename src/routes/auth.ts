import { Response, NextFunction } from 'express';
import * as passport from 'passport';

import { Auth } from '../auth/auth';
import { BaseRouter } from './baseRouter';
import { Request } from '../../types/helper';
import {
  createRefreshToken,
  deleteRefreshToken,
} from '../models/refreshToken/queries';
import { config } from '../config';
import { getFullUser, insertUserGraph } from '../models/user/queries';
import { Settings } from '../models/settings/model';

export class AuthRouter extends BaseRouter {
  constructor() {
    super();
    this.buildRoutes();
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    if (!req.signedCookies.token) return res.sendStatus(401);

    const oldToken = req.signedCookies.token;

    passport.authenticate(
      'cookie',
      { session: false },
      async (err, user, info) => {
        if (!user || err) {
          res.clearCookie('token', {
            path: '/auth',
            httpOnly: true,
          });
          await deleteRefreshToken(oldToken);

          return res.sendStatus(401);
        }

        const { token } = await Auth.createTokens(
          { id: user.id, email: user.email },
          res,
        );

        return res.json({ token });
      },
    )(req, res, next);
  }

  public async logout(req: Request, res: Response, next: NextFunction) {
    const token = req.signedCookies.token;

    res.clearCookie('token', {
      path: '/auth',
      httpOnly: true,
    });
    await deleteRefreshToken(token);

    return res.sendStatus(200);
  }

  public async login(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(401).send('Invalid email or password');

    const user = await getFullUser({ email });

    if (!user) return res.status(401).send('Invalid email or password');
    const isValidPassword = await Auth.comparePasswords(
      password,
      user.password,
    );

    if (!isValidPassword)
      return res.status(401).send('Invalid email or password');

    const { password: pass, salt, ...userData } = user;

    const { token } = await Auth.createTokens(
      { id: user.id, email: user.email },
      res,
    );
    return res.json({ token, user: userData });
  }

  public async register(req: Request, res: Response) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(401).send('Missing form data');
    }

    const user = await insertUserGraph({
      name,
      email,
      password,
      settings: Settings.defaults,
    });

    const { token } = await Auth.createTokens(
      { id: user.id, email: user.email },
      res,
    );

    return res.json({ token });
  }

  private buildRoutes() {
    this.router.post('/', (req, res, next) =>
      passport.authenticate('local', (err, user) => {
        if (err || !user) {
          return res
            .status(401)
            .json({ message: 'Email or password incorrect' });
        }
        const token = Auth.signToken(user);
        res.json({ token, user });
      })(req, res, next),
    );

    this.router.get('/refresh_token', this.refreshToken);
    this.router.post('/login', this.login);
    this.router.post('/register', this.register);
    this.router.get('/logout', Auth.isAuthenticated(), this.logout);
  }
}
