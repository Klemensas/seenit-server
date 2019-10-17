import { Server } from './server';
import { config } from './config';

Server.initializeApp().then(() => {
  console.log(('App is running at %s://%s:%d in %s mode'), config.tls.certPath ? 'https' : 'http', config.ip, config.port, config.env);
});
