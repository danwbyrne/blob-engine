import { List, Map } from 'immutable';
import { OutgoingEvent, OutgoingEvents } from './events/OutgoingEvents';

export class Player {
  public readonly id: number;
  public readonly socketId: string;
  public name: string;

  constructor(id: number, socketId: string) {
    this.id = id;
    this.socketId = socketId;
    this.name = `Player ${id}`;
  }
}

export class GameState {
  private players: Map<number,Player>;
  private updates: List<OutgoingEvent>;

  constructor() {
    this.players = Map<number,Player>();
    this.updates = List<OutgoingEvent>();
  }

  public newPlayer(id: number, socketId: string): GameState {
    this.players = this.players.set(id, (new Player(id, socketId)));

    this.updates = this.updates.push(OutgoingEvents.NewPlayer.create(id, socketId));

    return this;
  }

  public setPlayerName(id: number, name: string): GameState {
    this.players.get(id).name = name;

    const updatePlayerInfo = new OutgoingEvents.UpdatePlayerInfo(id, name);
    this.updates = this.updates.push(updatePlayerInfo);

    return this;
  }

  public changes(): OutgoingEvent[] {
    const updates = this.updates;
    this.updates = List<OutgoingEvent>();
    return updates.toJS();
  }
}

