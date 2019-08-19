import { GameEvent } from '@blob-engine/core';
import { Subject } from 'rxjs';
import { ConnectionManager, Socket } from './types';

export const createSocketHandler = (connectionManager: ConnectionManager, eventBus$: Subject<GameEvent>) => (
  socket: Socket,
) => {
  connectionManager.addConnection({
    id: socket.id,
    socket,
  });

  eventBus$.next({
    name: 'connect',
    args: {
      socketID: socket.id,
    },
  });

  socket.on('disconnect', () => {
    connectionManager.removeConnection(socket.id);
    eventBus$.next({
      name: 'disconnect',
      args: {
        socketID: socket.id,
      },
    });
  });
};
