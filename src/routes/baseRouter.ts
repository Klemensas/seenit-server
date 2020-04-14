import { Router } from 'express';

export class BaseRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    // limiter(this.router)({
    //   lookup: 'user.id',
    //   total: 150,
    //   expire: 1000 * 60 * 60,
    //   skipHeaders: true,
    // });
    // this.router.get('/*', (req, res) => res.sendStatus(404));
  }
}
