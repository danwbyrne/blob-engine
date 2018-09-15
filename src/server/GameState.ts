import { List, Map } from 'immutable';
import { Observable } from 'rxjs';
import { map, mergeAll, scan } from 'rxjs/operators';
import { GameEvents, IncomingEvent, OutgoingEvent } from '../shared/events';

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

    const newPlayer = new GameEvents.NewPlayer(id, socketId);
    this.updates = this.updates.push(newPlayer, newPlayer.broadcast());

    return this;
  }

  public setPlayerName(id: number, name: string): GameState {
    this.players.get(id).name = name;

    const updatePlayerInfo = new GameEvents.UpdatePlayerInfo(id, name);
    this.updates = this.updates.push(updatePlayerInfo);

    return this;
  }

  public changes(): OutgoingEvent[] {
    const updates = this.updates;
    this.updates = List<OutgoingEvent>();
    return updates.toJS();
  }
}

const accumulateGameState = (
  gameState: GameState,
  event: IncomingEvent,
): GameState => {
  return event.applyTo(gameState);
};

export const applyToGameState = () => (
  source$: Observable<IncomingEvent>,
): Observable<OutgoingEvent> =>
  source$.pipe(
    scan<IncomingEvent, GameState>(accumulateGameState, new GameState()),
    map((gameState: GameState) => gameState.changes()),
    mergeAll(),
  );
