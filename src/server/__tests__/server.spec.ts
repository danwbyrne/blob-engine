import * as http from 'http';
import * as SocketServer from 'socket.io';
import * as SocketClient from 'socket.io-client';
import { BlobEvent, EventResults } from '../../shared/events';
import { firstMatching } from '../../shared/operators';
import { createObservableServer } from '../server';

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
    observableServer = createObservableServer(socketServer, eventKeys);

    serverInstance = httpServer.listen(port);
  });

  afterEach(() => {
    serverInstance.close();
    client = null;
  });

  it('emits a new player event when client connects', (done: any) => {
    observableServer.pipe(firstMatching('np')).subscribe(
      (next: BlobEvent) => {
        expect(next).toEqual(new BlobEvent('np', null));
        done();
      },
      (error: any) => {
        done.fail(error);
      },
    );

    client = connect();
  });

  // why no work :(
  xit('emits a disconnect event when client disconnects', (done: any) => {
    observableServer.pipe(firstMatching('dc')).subscribe(
      (next: BlobEvent) => {
        console.log(next);
        try {
          expect(next).toEqual('hi');
        } catch(error) {
          // console.log(error);
          done.fail(error);
        } finally {
          done();
        }
      },
      (error: any) => {
        done.fail(error);
      },
      () => {
        console.log('complete')
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
