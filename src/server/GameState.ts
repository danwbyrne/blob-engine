import { List } from 'immutable';
import { Observable } from 'rxjs';
import { map, mergeAll, scan } from 'rxjs/operators';
import { GameEvent, GameEvents, ServerEvent } from '../shared/events';
import { BlobMiddleware } from './Logger';

export class Player {
  public readonly id: number;
  public readonly socketId: string;

  constructor(id: number, socketId: string) {
    this.id = id;
    this.socketId = socketId;
  }
}

export class GameState {
  private players: List<Player>;
  private updates: List<GameEvent>;

  constructor() {
    this.players = List<Player>();
    this.updates = List<GameEvent>();
  }

  public newPlayer(id: number, socketId: string): GameState {
    this.players.push(new Player(id, socketId));

    const newPlayer = new GameEvents.NewPlayer(id, socketId);
    this.updates.push(newPlayer, newPlayer.broadcast());

    return this;
  }

  public changes(): ServerEvent[] {
    const updates = this.updates;
    this.updates = List<GameEvent>();
    return updates.toJS();
  }
}

const accumulateGameState = (
  gameState: GameState,
  event: ServerEvent,
): GameState => {
  return event.applyTo(gameState);
};

export const applyToGameState = (): BlobMiddleware => (
  source$: Observable<ServerEvent>,
) =>
  source$.pipe(
    scan<ServerEvent, GameState>(accumulateGameState, new GameState()),
    map((gameState: GameState) => gameState.changes()),
    mergeAll(),
  );
