import { GameEventHandlers } from '@blob-engine/core';
import { createServer } from './createServer';

interface TestGameState {
  readonly test: string;
}

const initialHandlers: GameEventHandlers<TestGameState> = new Map();
initialHandlers.set('connect', (state, event) => ({ test: event.name }));
initialHandlers.set('disconnect', (state, event) => ({ test: event.name }));

const server = createServer<TestGameState>({
  tickRate: 2000,
  initialState: {
    test: 'test',
  },
  initialHandlers,
});

server.listen(5000, () => {
  // tslint:disable-next-line: no-console
  console.log('listening on *:5000');
});
