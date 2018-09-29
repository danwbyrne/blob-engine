import { GameState } from '../GameState';

export interface IncomingEvent {
  readonly type: string;
  readonly id: number;
  applyTo: (gameState: GameState) => GameState;
}

export interface IncomingEventFactory {
  readonly type: string;
  build: (id: number, data: any) => IncomingEvent;
}

export namespace IncomingEvents {
  export class Connect implements IncomingEvent {
    public readonly id: number;
    public readonly type: string;
    public readonly socketId: string;

    constructor(id: number, socketId: string) {
      this.id = id;
      this.type = 'connect';
      this.socketId = socketId;
    }

    public applyTo = (gameState: GameState) =>
      gameState.newPlayer(this.id, this.socketId);
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

  export class SetName implements IncomingEvent {
    public readonly id: number;
    public readonly type: string;

    private readonly name: string;

    constructor(id: number, name: string) {
      this.id = id;
      this.type = 'set name';
      this.name = name;
    }

    public applyTo = (gameState: GameState) =>
      gameState.setPlayerName(this.id, this.name);
  }
}
