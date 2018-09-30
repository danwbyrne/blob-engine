import { GameState, IncomingEvent, OutgoingEvent } from '@blob-engine/utils';
import { Observable } from 'rxjs';
import { map, mergeAll, scan } from 'rxjs/operators';

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
