import { Observable, Observer } from 'rxjs/index';
import * as SocketIO from 'socket.io';
import { BlobEvent } from '../shared/events';
import { IdGenerator } from './IdGenerator';


export function createSocketServer(
  io: SocketIO.Server,
  eventKeys: string[],
  idGenerator: IdGenerator,
): Observable<BlobEvent> {
  return new Observable<BlobEvent>((observer: Observer<BlobEvent>) => {
    // Set up new connection
    io.on('connection', (socket: SocketIO.Socket) => {
      // Set up event handlers
      eventKeys.forEach((key: string) => {
        socket.on(key, (data: any) => {
          observer.next(new BlobEvent(key, data));
        });
      });

      const id = idGenerator.next();

      // Set up disconnect handler
      socket.on('disconnect', () => {
        observer.next(BlobEvent.DISCONNECT(id));
      });

      // Output new player EventResult
      observer.next(BlobEvent.CONNECTION(id));
    });

    // Set up error handlers
    io.on('connect_error', (data: any) => {
      console.log('connect error!', data);
    });

    io.on('connect_timeout', () => {
      console.log('connect timeout!');
    });

    io.on('error', (data: any) => {
      console.log('error!', data);
    });
  });
}
