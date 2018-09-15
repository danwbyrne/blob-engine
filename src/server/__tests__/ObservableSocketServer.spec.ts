import * as http from 'http';
import { Observable, of } from 'rxjs';
import { concatMap, filter, take, takeWhile } from 'rxjs/operators';
import * as SocketServer from 'socket.io';
import * as SocketClient from 'socket.io-client';
import {
  GameEvents,
  IncomingEvent,
  IncomingEventFactory,
  OutgoingEvent,
  PlayerEvents,
  ServerEvents,
} from '../../shared/events';
import { eventsMatching, firstMatching } from '../../shared/operators';
import { applyToGameState } from '../GameState';
import { DefaultIdGenerator, IdGenerator } from '../IdGenerator';
import { BlobMiddleware, createLogger, LogFn } from '../Logger';
import { createObservableSocketServer } from '../ObservableSocketServer';
import NoOpEvent = ServerEvents.NoOpEvent;
import NewPlayer = GameEvents.NewPlayer;
import Connect = ServerEvents.Connect;
import SetName = PlayerEvents.SetName;

const port = 9001;
const clientOptions = {
  reconnection: false,
};

const connect = (): any =>
  SocketClient(`http://localhost:${port}`, clientOptions);

const testBlobEventFactory = (type: string): IncomingEventFactory => ({
  type,
  build: (id: number, data: object): IncomingEvent =>
    new NoOpEvent(type, id, data),
});

const allUntil = (type: string) => (
  source$: Observable<IncomingEvent>,
): Observable<IncomingEvent> =>
  source$.pipe(
    concatMap(
      (next: IncomingEvent) => (next.type === type ? of(next, null) : of(next)),
    ),
    takeWhile<IncomingEvent>((next: IncomingEvent) => next !== null),
  );

const ignore = (type: string) =>
  filter((next: IncomingEvent) => next.type !== 'connect');

describe('server', () => {
  let socketServer: SocketServer.Server;
  let eventFactories: IncomingEventFactory[];
  let idGenerator: IdGenerator;
  let observableServer: Observable<IncomingEvent>;
  let client: any;

  beforeEach(() => {
    socketServer = SocketServer(http.createServer());
    eventFactories = [
      testBlobEventFactory('1'),
      testBlobEventFactory('2'),
      testBlobEventFactory('3'),
    ];
    idGenerator = new DefaultIdGenerator();
    observableServer = createObservableSocketServer(
      socketServer,
      eventFactories,
      idGenerator,
    );

    socketServer.listen(port);
  });

  // socket server needs a little time to clean itself up
  afterEach(() => new Promise((resolve) => setTimeout(resolve, 100)));

  it('emits a new player event when client connects', (done: any) => {
    observableServer.pipe(firstMatching<IncomingEvent>('connect')).subscribe(
      (next: IncomingEvent) => {
        const result: Connect = next as Connect;
        expect(result.type).toEqual('connect');
        expect(result.id).toEqual(1);
        expect(result.socketId).toBeDefined();
        done();
      },
      (error: any) => {
        done.fail(error);
      },
    );

    client = connect();
  });

  it('emits events when valid keys are received', (done: any) => {
    const results: IncomingEvent[] = [];

    observableServer
      .pipe(
        ignore('connect'),
        allUntil('1'),
      )
      .subscribe(
        (next: IncomingEvent) => {
          results.push(next);
        },
        (error: any) => {
          done.fail(error);
        },
        () => {
          expect(results).toEqual([
            new NoOpEvent('2', 1, { meep: 'moop' }),
            new NoOpEvent('1', 1, { beep: 'boop' }),
          ]);

          done();
        },
      );

    client = connect();
    client.emit('lol', { meep: 'moop' });
    client.emit('two', { meep: 'moop' });
    client.emit('18', { meep: 'moop' });
    client.emit('2', { meep: 'moop' });
    client.emit('1', { beep: 'boop' });
  });

  it('increments player id when client connects', (done: any) => {
    const results: IncomingEvent[] = [];

    observableServer
      .pipe(
        eventsMatching('connect'),
        take(2),
      )
      .subscribe(
        (next: IncomingEvent) => {
          results.push(next);
        },
        (error: any) => {
          done.fail(error);
        },
        () => {
          results.forEach((result: IncomingEvent, index: number) => {
            expect(result.type).toEqual('connect');
            expect(result.id).toEqual(index + 1);
          });

          done();
        },
      );

    client = connect();
    client = connect();
  });
  // this test is flaky; less so with the sleep on afterEach
  it('attaches the player id to each event', (done: any) => {
    const results: IncomingEvent[] = [];

    observableServer
      .pipe(
        ignore('connect'),
        take(4),
      )
      .subscribe(
        (next: IncomingEvent) => {
          results.push(next);
        },
        (error: any) => {
          done.fail(error);
        },
        () => {
          expect(results).toEqual([
            new NoOpEvent('1', 1, { which: 'first' }),
            new NoOpEvent('2', 2, { which: 'second' }),
            new NoOpEvent('2', 1, { which: 'third' }),
            new NoOpEvent('3', 2, { which: 'fourth' }),
          ]);

          done();
        },
      );

    client = connect();
    const client1 = connect();

    client.emit('1', { which: 'first' });
    client1.emit('2', { which: 'second' });
    client.emit('2', { which: 'third' });
    client1.emit('3', { which: 'fourth' });
  });

  describe('with logger', () => {
    let logMiddleware: BlobMiddleware;
    let logFn: jest.Mock<LogFn>;

    beforeEach(() => {
      logFn = jest.fn<LogFn>();
      logMiddleware = createLogger(logFn);
    });

    it('logs each event', (done: any) => {
      const results: IncomingEvent[] = [];

      observableServer
        .pipe(
          logMiddleware,
          take(3),
        )
        .subscribe(
          (next: IncomingEvent) => {
            results.push(next);
          },
          (error: any) => {
            done.fail(error);
          },
          () => {
            expect(logFn.mock.calls.length).toEqual(3);

            expect(logFn.mock.calls[0].length).toEqual(1);
            expect(logFn.mock.calls[0][0].type).toEqual('connect');
            expect(logFn.mock.calls[0][0].id).toEqual(1);
            expect(logFn.mock.calls[0][0].socketId).toBeDefined();

            expect(logFn.mock.calls[1]).toEqual([
              { type: '1', id: 1, data: { meep: 'moop' } },
            ]);
            expect(logFn.mock.calls[2]).toEqual([
              { type: '2', id: 1, data: { haha: 'lol' } },
            ]);

            done();
          },
        );

      client = connect();
      client.emit('1', { meep: 'moop' });
      client.emit('2', { haha: 'lol' });
    });
  });

  describe('game server', () => {
    let gameServer: Observable<OutgoingEvent>;

    beforeEach(() => {
      socketServer.close();
      eventFactories = [
        {
          type: 'set name',
          build: (id: number, data: any) => new SetName(id, data.name),
        },
      ];

      observableServer = createObservableSocketServer(
        socketServer,
        eventFactories,
        idGenerator,
      );

      gameServer = observableServer.pipe(applyToGameState());
      socketServer.listen(port);
    });

    it('emits a broadcasted new player event when client connects', (done: any) => {
      const results: OutgoingEvent[] = [];

      gameServer.pipe(take(2)).subscribe(
        (next: OutgoingEvent) => {
          results.push(next);
        },
        (error: any) => {
          done.fail(error);
        },
        () => {
          expect(results.length).toEqual(2);

          const newPlayer1 = results[0] as NewPlayer;
          expect(newPlayer1.type).toEqual('new player');
          expect(newPlayer1.socketId).toBeDefined();
          expect(newPlayer1.data()).toEqual({ id: 1 });

          const newPlayer2 = results[1] as NewPlayer;
          expect(newPlayer2.type).toEqual('new player');
          expect(newPlayer2.socketId).toEqual('');
          expect(newPlayer2.data()).toEqual({ id: 1 });

          done();
        },
      );

      client = connect();
    });

    it('emits an UpdatePlayerInfo event when client sets name', (done: any) => {
      const results: OutgoingEvent[] = [];

      gameServer.pipe(firstMatching<OutgoingEvent>('update player')).subscribe(
        (next: OutgoingEvent) => {
          results.push(next);
        },
        (error: any) => {
          done.fail(error);
        },
        () => {
          expect(results.length).toEqual(1);

          expect(results[0].type).toEqual('update player');
          expect(results[0].data()).toEqual({ id: 1, name: 'bobby boy' });

          done();
        },
      );

      client = connect();
      client.emit('set name', {
        name: 'bobby boy',
      });
    });
  });

  // why no work :(
  xit('emits a disconnect event when client disconnects', (done: any) => {
    const results: IncomingEvent[] = [];

    observableServer.pipe(take(2)).subscribe(
      (next: IncomingEvent) => {
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
    client = null;
  });
});
