import * as express from 'express';

import { config } from '../config';
import dailyExport from './dailyExport';
import { Tv } from '../models/tv';

const app = express();

app.get('/export', async (req, res) => {
  const count = await Tv.query().count();
  res.json({
    count,
    export: dailyExport.exportJob,
  })
});

app.listen(config.port);

const date = new Date('2019-09-06');
export default dailyExport.loadDailies(date, true);
