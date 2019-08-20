import { GameEventHandlers } from '@blob-engine/core';
import { createServer } from './createServer';

interface TestGameState {
  readonly test: string;
}

const handlers: GameEventHandlers<TestGameState> = new Map();
handlers.set('connect', (_state, event) => ({ test: event.type }));
handlers.set('disconnect', (_state, event) => ({ test: event.type }));

const server = createServer<TestGameState>({
  tickRate: 2000,
  initialState: {
    test: 'test',
  },
  handlers,
});

server.listen(5000, () => {
  // tslint:disable-next-line: no-console
  console.log('listening on *:5000');
});
