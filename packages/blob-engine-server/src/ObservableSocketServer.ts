import {
  IncomingEvent,
  IncomingEventFactory,
  IncomingEvents,
} from '@blob-engine/utils';
import { Observable, Observer } from 'rxjs';
import * as SocketIO from 'socket.io';
import { IdGenerator } from './IdGenerator';

export function createObservableSocketServer(
  io: SocketIO.Server,
  eventFactories: IncomingEventFactory[],
  idGenerator: IdGenerator,
): Observable<IncomingEvent> {
  return new Observable<IncomingEvent>((observer: Observer<IncomingEvent>) => {
    const sockets: SocketIO.Socket[] = [];

    // Set up new connection
    io.on('connection', (socket: SocketIO.Socket) => {
      sockets.push(socket);
      const id = idGenerator.next();

      // Set up event handlers
      eventFactories.forEach((factory: IncomingEventFactory) => {
        socket.on(factory.type, (data: any) =>
          observer.next(factory.build(id, data)),
        );
      });

      // Set up disconnect handler
      socket.on('disconnect', () => {
        observer.next(new IncomingEvents.Disconnect(id));
        sockets.splice(sockets.indexOf(socket));
      });

      // Output new player EventResult
      observer.next(new IncomingEvents.Connect(id, socket.id));
    });

    // Clean up
    return () => {
      io.close();
      sockets.forEach((socket: SocketIO.Socket) => socket.disconnect(true));
    };
  });
}
