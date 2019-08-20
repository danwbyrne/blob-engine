import { GameEvent } from '@blob-engine/core';
import { Subject } from 'rxjs';
import { ConnectionManager, Socket } from './types';

const connectEvent = (socketID: string) => ({
  type: 'connect',
  args: {
    socketID,
  },
});

const disconnectEvent = (socketID: string) => ({
  type: 'disconnect',
  args: {
    socketID,
  },
});

export const createSocketHandler = (
  connectionManager: ConnectionManager,
  eventBus$: Subject<GameEvent>,
  gameEvents: readonly string[],
) => (socket: Socket) => {
  connectionManager.addConnection({
    id: socket.id,
    socket,
  });

  eventBus$.next(connectEvent(socket.id));

  socket.on('disconnect', () => {
    connectionManager.removeConnection(socket.id);
    eventBus$.next(disconnectEvent(socket.id));
  });

  // this should probably be a map that is returned;
  // we could also do some arg assertions here to avoid bad data.
  gameEvents.forEach((type) =>
    socket.on(type, (data) => {
      eventBus$.next({
        type,
        args: data,
      });
    }),
  );
};
