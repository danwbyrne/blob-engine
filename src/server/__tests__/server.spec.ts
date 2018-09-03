import * as http from 'http';
import * as SocketServer from 'socket.io';
import * as SocketClient from 'socket.io-client';
import { BlobEvent, EventResults } from '../../shared/events';
import { eventsMatching, firstMatching } from '../../shared/operators';
import { createObservableSocketServer } from '../SocketServer';
import { skip, take } from 'rxjs/operators';
import { DefaultIdGenerator } from '../IdGenerator';
import { BlobMiddleware, createLogger, LogFn } from '../Logger';
import Mock = jest.Mock;

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
    observableServer = createObservableSocketServer(socketServer, eventKeys, idGenerator);

    serverInstance = httpServer.listen(port);
  });

  afterEach(() => {
    serverInstance.close();
    client = null;
  });

  it('emits a new player event when client connects', (done: any) => {
    observableServer.pipe(firstMatching('np')).subscribe(
      (next: BlobEvent) => {
        expect(next).toEqual(new BlobEvent('np', 1));
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
        expect(next).toEqual(new BlobEvent('1', 1, { meep: 'moop' }));
        done();
      },
      (error: any) => {
        done.fail(error);
      },
    );

    client = connect();
    client.emit('1', { meep: 'moop' });
  });

  describe('with logger', () => {
    let logMiddleware: BlobMiddleware;
    let logFn: Mock<LogFn>;

    beforeEach(() => {
      logFn = jest.fn<LogFn>();
      logMiddleware = createLogger(logFn);
    });

    it('logs each event', (done: any) => {
      const results: BlobEvent[] = [];

      observableServer.pipe(
        logMiddleware,
        take(3),
      ).subscribe(
        (next: BlobEvent) => {
          results.push(next);
        },
        (error: any) => {
          done.fail(error);
        },
        () => {
          expect(logFn.mock.calls).toEqual([
            [{ type: 'np', id: 1, data: null  }],
            [{ type: '1', id: 1, data: { meep: 'moop' } }],
            [{ type: '2',  id: 1, data: { meep: 'boop' } }],
          ]);
          done();
        },
      );

      client = connect();
      client.emit('1', { meep: 'moop' });
      client.emit('2', { meep: 'boop' });
    });
  });
});
