import { Observable } from 'rxjs';
import { map, mergeAll, scan } from 'rxjs/operators';
import { IncomingEvent } from './events/IncomingEvents';
import { OutgoingEvent } from './events/OutgoingEvents';
import { GameState } from './GameState';

const applyToGameState = (
  gameState: GameState,
  event: IncomingEvent,
): GameState => {
  return event.applyTo(gameState);
};

export const processIncomingEvents = (initialState = new GameState()) => (
  source$: Observable<IncomingEvent>,
): Observable<OutgoingEvent> =>
  source$.pipe(
    scan<IncomingEvent, GameState>(applyToGameState, initialState),
    map((gameState: GameState) => gameState.changes()),
    mergeAll(),
  );
