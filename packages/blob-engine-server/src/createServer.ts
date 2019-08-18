import { GameEvent, GameState } from '@blob-engine/core';
import debug from 'debug';
// tslint:disable-next-line: match-default-export-name
import express from 'express';
import { Server } from 'http';
import { Subject, timer } from 'rxjs';
import SocketIO from 'socket.io';
import { ConnectionManager } from './ConnectionManager';
import { createSocketHandler } from './createSocketHandler';

const log = debug('blog-engine:server');

interface CreateServerOptions<State> {
  readonly tickRate: number;
  readonly initialState: State;
}

export const createServer = <State>(options: CreateServerOptions<State>) => {
  const app = express();
  app.use(express.static('public'));
  const server = new Server(app);

  const eventBusInit$ = new Subject<GameEvent>();
  const connectionManager = new ConnectionManager();
  const { handler: socketHandler, eventBus$ } = createSocketHandler(connectionManager, eventBusInit$);

  const gameState = new GameState({
    initialState: options.initialState,
    initialHandlers: new Map(),
    eventBus$,
  });

  timer(0, options.tickRate).subscribe(() => console.log(gameState.getState()));

  gameState.registerEventHandler('init', (state: State) => {
    log('INIT STATE HANDLER FIRED');

    return state;
  });

  const io = SocketIO(server);
  io.on('connection', socketHandler);

  io.on('connect_error', (error: unknown) => {
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
