import { Observable, Observer } from 'rxjs/index';
import * as SocketIO from 'socket.io';
import { BlobEventFactory, ServerEvent, ServerEvents } from '../shared/events';
import { IdGenerator } from './IdGenerator';

export function createObservableSocketServer(
  io: SocketIO.Server,
  eventFactories: BlobEventFactory[],
  idGenerator: IdGenerator,
): Observable<ServerEvent> {
  return new Observable<ServerEvent>((observer: Observer<ServerEvent>) => {
    const sockets: SocketIO.Socket[] = [];

    // Set up new connection
    io.on('connection', (socket: SocketIO.Socket) => {
      sockets.push(socket);
      const id = idGenerator.next();

      // Set up event handlers
      eventFactories.forEach((factory: BlobEventFactory) => {
        socket.on(factory.type, (data: any) => {
          observer.next(factory.build(id, data));
        });
      });

      // Set up disconnect handler
      socket.on('disconnect', () => {
        observer.next(new ServerEvents.Disconnect(id));
        sockets.splice(sockets.indexOf(socket));
      });

      // Output new player EventResult
      observer.next(new ServerEvents.Connect(id, socket.id));
    });

    // Clean up
    return () => {
      io.close();
      sockets.forEach((socket: SocketIO.Socket) => socket.disconnect(true));
    };
  });
}
