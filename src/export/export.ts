import * as express from 'express';

import { config } from '../config';
import dailyExport from './dailyExport';
import { Tv } from '../models/tv/model';

const app = express();

app.get('/export', async (req, res) => {
  const count = await Tv.query().count();
  res.setHeader('Content-Type', 'application/json');
  res.end(
    JSON.stringify(
      {
        count,
        export: dailyExport.exportJob,
      },
      null,
      2,
    ),
  );
});

app.listen(config.port);

// Run for yesterday in case today still isn't generated
const date = new Date(Date.now() - 86400000);
export default dailyExport.loadDailies(date, true);
