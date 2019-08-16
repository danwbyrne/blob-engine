import debug from 'debug';
// tslint:disable-next-line: match-default-export-name
import express from 'express';
import { Server } from 'http';
import { timer } from 'rxjs';
import SocketIO from 'socket.io';
import { ConnectionManager } from './ConnectionManager';
import { createSocketHandler } from './createSocketHandler';

const log = debug('blog-engine:server');

export const createServer = () => {
  const app = express();
  app.use(express.static('public'));
  const server = new Server(app);

  const connectionManager = new ConnectionManager();
  const socketHandler = createSocketHandler(connectionManager);

  const io = SocketIO(server);
  io.on('connection', socketHandler);

  timer(0, 2000).subscribe(() =>
    // tslint:disable-next-line: no-console
    console.log(`current connections: ${Object.keys(connectionManager.getConnections())}`),
  ); // REMOVE THIS

  // tslint:disable-next-line: no-any
  io.on('connect_error', (error: any) => {
    log('CONNECT_ERROR: %o', error);
  });

  io.on('connect_timeout', () => {
    log('connection timeout');
  });

  io.on('error', (error?: Error) => {
    log('error: %o', error);
  });

  return server;
};
