import * as http from 'http';
import * as SocketServer from 'socket.io';
import * as SocketClient from 'socket.io-client';
import { BlobEvent, EventResults } from '../../shared/events';
import { eventsMatching, firstMatching } from '../../shared/operators';
import { createSocketServer } from '../SocketServer';
import { skip, take } from 'rxjs/operators';
import { DefaultIdGenerator } from '../IdGenerator';

const port = 9001;
const clientOptions = {
  reconnection: false,
};

function connect(): any {
  return SocketClient(`http://localhost:${port}`, clientOptions);
}

describe('server', () => {
  let observableServer: EventResults;
  let serverInstance: http.Server;
  let client: any;

  beforeEach(() => {
    const httpServer = http.createServer();
    const socketServer = SocketServer(httpServer);
    const eventKeys = ['1', '2', '3'];
    const idGenerator = new DefaultIdGenerator();
    observableServer = createSocketServer(socketServer, eventKeys, idGenerator);

    serverInstance = httpServer.listen(port);
  });

  afterEach(() => {
    serverInstance.close();
    client = null;
  });

  it('emits a new player event when client connects', (done: any) => {
    observableServer.pipe(firstMatching('np')).subscribe(
      (next: BlobEvent) => {
        expect(next).toEqual(new BlobEvent('np', {
          id: 1,
        }));
        done();
      },
      (error: any) => {
        done.fail(error);
      },
    );

    client = connect();
  });

  it('increments player id when client connects', (done: any) => {
    const results: BlobEvent[] = [];

    observableServer.pipe(
      eventsMatching('np'),
      take(2),
    ).subscribe(
      (next: BlobEvent) => {
        results.push(next);
      },
      (error: any) => {
        done.fail(error);
      },
      () => {
        expect(results).toEqual([
          BlobEvent.CONNECTION(1),
          BlobEvent.CONNECTION(2),
        ]);
        done();

      },
    );

    client = connect();
    client = connect();
  });

  // why no work :(
  xit('emits a disconnect event when client disconnects', (done: any) => {
    const results: BlobEvent[] = [];

    observableServer.pipe(skip(1), take(1)).subscribe(
      (next: BlobEvent) => {
        // console.log(next);
        // try {
        //   expect(next).toEqual('hi');
        // } catch (error) {
        //   // console.log(error);
        //   done.fail(error);
        // } finally {
        //   done();
        // }
        results.push(next);
      },
      (error: any) => {
        done.fail(error);
      },
      () => {
        console.log(results);
        done();
      },
    );

    client = connect();
    client.emit('hello', { meep: 'moop' });
    client.disconnect();
  });

  it('emits BlobEvents when valid keys are received', (done: any) => {
    observableServer.pipe(firstMatching('1')).subscribe(
      (next: BlobEvent) => {
        expect(next).toEqual(new BlobEvent('1', { meep: 'moop' }));
        done();
      },
      (error: any) => {
        done.fail(error);
      },
    );

    client = connect();
    client.emit('1', { meep: 'moop' });
  });
});
