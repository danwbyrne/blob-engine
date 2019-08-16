import { ConnectionManager, Socket } from './types';

export const createSocketHandler = (connectionManager: ConnectionManager) => (socket: Socket) => {
  connectionManager.addConnection({
    id: socket.id,
    socket,
  });

  socket.on('disconnect', () => {
    connectionManager.removeConnection(socket.id);
  });
};
