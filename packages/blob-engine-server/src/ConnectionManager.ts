import debug from 'debug';
import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Connection, Connections } from './types';

const log = debug('blob-engine:connection-manager');

// ideally we handle 'room' management here as well.
// almost definitely we don't even need it and can do anything
// related to connection management with the SocketIO object.

export class ConnectionManager {
  public readonly connections$: Observable<Connections>;
  private readonly connectionsInternal$: BehaviorSubject<Connections>;
  public constructor(initialConnections: Connections = {}) {
    this.connectionsInternal$ = new BehaviorSubject(initialConnections);
    this.connections$ = this.connectionsInternal$.pipe(distinctUntilChanged((a, b) => _.isEqual(a, b)));
  }

  public getConnections() {
    return this.connectionsInternal$.getValue();
  }

  public addConnection(connection: Connection) {
    const { id, socket } = connection;
    const currentConnections = this.getConnections();
    this.connectionsInternal$.next({
      ...currentConnections,
      [id]: socket,
    });
    log('new connection: %o', { socketID: id });
  }

  public removeConnection(id: string) {
    const { [id]: socket, ...reducedConnections } = this.getConnections();
    if (socket !== undefined) {
      log('terminating connection: %o', { socketID: id });
      this.connectionsInternal$.next(reducedConnections);
    }
  }
}
