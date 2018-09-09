import { GameState } from '../server/GameState';

// export abstract class BlobEvent {
//   public static CONNECT = (id: number): BlobEvent => new BlobEvent('np', id);
//   public static DISCONNECT = (id: number): BlobEvent => new BlobEvent('dc', id);
//
//   public readonly type: string;
//   public readonly id: number;
//   public readonly data: any;
//
//   constructor(type: string, id: number, data: any = null) {
//     this.type = type;
//     this.id = id;
//     this.data = data;
//   }
//
//   public abstract applyTo(gameState: GameState): GameState;
// }

export interface GameEvent {
  readonly type: string;
  readonly id: number;
  readonly socketId: string;
  data: () => object;
}

export interface BroadcastGameEvent {
  broadcast: () => GameEvent;
}

export namespace GameEvents {
  export class NewPlayer implements GameEvent, BroadcastGameEvent {
    public readonly id: number;
    public readonly socketId: string;
    public readonly type: string;

    constructor(id: number, socketId: string) {
      this.id = id;
      this.socketId = socketId;
      this.type = 'new player';
    }

    public data = (): object => ({
      id: this.id,
    });

    public broadcast = (): GameEvent => new NewPlayer(this.id, '');
  }
}

export interface ServerEvent {
  readonly type: string;
  readonly id: number;
  readonly socketId?: string;
  applyTo: (gameState: GameState) => GameState;
}

export namespace ServerEvents {
  export class Connect implements ServerEvent {
    public readonly id: number;
    public readonly type: string;

    public readonly socketId: string;

    constructor(id: number, socketId: string) {
      this.id = id;
      this.type = 'connect';
      this.socketId = socketId;
    }

    public applyTo(gameState: GameState): GameState {
      return gameState.newPlayer(this.id, this.socketId);
    }
  }

  export class Disconnect implements ServerEvent {
    public readonly id: number;
    public readonly type: string;

    constructor(id: number) {
      this.id = id;
      this.type = 'disconnect';
    }

    public applyTo(gameState: GameState): GameState {
      return gameState;
    }
  }

  export class NoOpEvent implements ServerEvent {
    public readonly id: number;
    public readonly type: string;
    public readonly data: object;

    constructor(type: string, id: number, data: object) {
      this.type = type;
      this.id = id;
      this.data = data;
    }

    public applyTo(gameState: GameState): GameState {
      return gameState;
    }
  }
}

export interface BlobEventFactory {
  readonly type: string;
  build: (id: number, data: object) => ServerEvent;
}
