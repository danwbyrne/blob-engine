import { GameState } from '../server/GameState';

export interface BlobEvent {
  readonly type: string;
  readonly id: number;
}

export interface OutgoingEvent extends BlobEvent{
  data: () => object;
}

export interface BroadcastGameEvent {
  broadcast: () => OutgoingEvent;
}

export namespace GameEvents {
  export class NewPlayer implements OutgoingEvent, BroadcastGameEvent {
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

    public broadcast = (): OutgoingEvent => new NewPlayer(this.id, '');
  }

  export class UpdatePlayerInfo implements OutgoingEvent {
    public readonly id: number;
    public readonly type: string;

    private name: string;

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
      this.type = 'update player';
    }

    public data = (): object => ({
      id: this.id,
      name: this.name,
    });
  }
}

export interface IncomingEvent extends BlobEvent {
  applyTo: (gameState: GameState) => GameState;
}

export namespace ServerEvents {
  export class Connect implements IncomingEvent {
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

  export class Disconnect implements IncomingEvent {
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

  export class NoOpEvent implements IncomingEvent {
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

export namespace PlayerEvents {
  export class SetName implements IncomingEvent {
    public readonly id: number;
    public readonly type: string;

    private readonly name: string;

    constructor(id: number, name: string) {
      this.id = id;
      this.type = 'set name';
      this.name = name;
    }

    public applyTo = (gameState: GameState) => gameState.setPlayerName(this.id, this.name);
  }
}

export interface IncomingEventFactory {
  readonly type: string;
  build: (id: number, data: any) => IncomingEvent;
}
