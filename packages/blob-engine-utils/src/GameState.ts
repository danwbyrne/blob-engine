import { List, Map } from 'immutable';
import { OutgoingEvent, OutgoingEvents } from './events';

export interface PlayerOptions {
  readonly id: number;
  readonly socketId: string;
}

export class Player {
  public readonly id: number;
  public readonly socketId: string;
  public name: string;

  constructor(options: PlayerOptions) {
    this.id = options.id;
    this.socketId = options.socketId;
    this.name = `Player ${this.id}`;
  }
}

export class GameState {
  private players: Map<number, Player>;
  private updates: List<OutgoingEvent>;

  constructor() {
    this.players = Map<number, Player>();
    this.updates = List<OutgoingEvent>();
  }

  public newPlayer(id: number, socketId: string): GameState {
    this.players = this.players.set(id, new Player(id, socketId));

    this.updates = this.updates.push(OutgoingEvents.NewPlayer.create(id));

    return this;
  }

  public setPlayerName(id: number, name: string): GameState {
    this.players.get(id).name = name;

    const updatePlayerInfo = OutgoingEvents.UpdatePlayerInfo.create(id, name);
    this.updates = this.updates.push(updatePlayerInfo);

    return this;
  }

  public changes(): OutgoingEvent[] {
    const updates = this.updates;
    this.updates = List<OutgoingEvent>();
    return updates.toJS();
  }
}
