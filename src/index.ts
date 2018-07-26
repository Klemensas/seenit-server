import { Server } from './server';
import { config } from './config';

Server.initializeApp().then(() => {
  console.log(('App is running at http://localhost:%d in %s mode'), config.port, config.env);
});
