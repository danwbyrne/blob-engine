import { Observable, Observer } from 'rxjs/index';
import * as SocketIO from 'socket.io';
import { BlobEvent } from '../shared/events';
import { IdGenerator } from './IdGenerator';


export function createObservableSocketServer(
  io: SocketIO.Server,
  eventKeys: string[],
  idGenerator: IdGenerator,
): Observable<BlobEvent> {
  return new Observable<BlobEvent>((observer: Observer<BlobEvent>) => {
    const sockets: SocketIO.Socket[] = [];

    // Set up new connection
    io.on('connection', (socket: SocketIO.Socket) => {
      sockets.push(socket);
      const id = idGenerator.next();

      // Set up event handlers
      eventKeys.forEach((key: string) => {
        socket.on(key, (data: any) => {
          observer.next(new BlobEvent(key, id, data));
        });
      });

      // Set up disconnect handler
      socket.on('disconnect', () => {
        observer.next(BlobEvent.DISCONNECT(id));
        sockets.splice(sockets.indexOf(socket));
      });

      // Output new player EventResult
      observer.next(BlobEvent.CONNECTION(id));
    });

    // Clean up
    return () => {
      io.close();
      sockets.forEach((socket: SocketIO.Socket) => socket.disconnect(true));
    }
  });
}
