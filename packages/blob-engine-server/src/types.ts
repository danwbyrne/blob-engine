import { Observable } from 'rxjs';

export type Socket = SocketIO.Socket;

export interface Connection {
  readonly id: string;
  readonly socket: Socket;
}

export type Connections = Record<Connection['id'], Connection['socket']>;

export interface ConnectionManager {
  readonly addConnection: (connection: Connection) => void;
  readonly removeConnection: (id: string) => void;
  readonly getConnections: () => Connections;
  readonly connections$: Observable<Connections>;
}
