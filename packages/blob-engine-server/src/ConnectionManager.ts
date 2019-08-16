import debug from 'debug';
import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { Connection, Connections } from './types';

const log = debug('blob-engine:connection-manager');

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
    // tslint:disable-next-line: strict-type-predicates
    if (socket !== undefined) {
      log('terminating connection: %o', { socketID: id });
      this.connectionsInternal$.next(reducedConnections);
    }
  }
}
