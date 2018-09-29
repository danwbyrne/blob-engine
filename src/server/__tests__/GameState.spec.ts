import { Subject } from 'rxjs';
import { take } from 'rxjs/operators';
import { IncomingEvent, IncomingEvents } from '../events/IncomingEvents';
import Connect = IncomingEvents.Connect;
import { OutgoingEvent } from '../events/OutgoingEvents';
import { GameState } from '../GameState';
import { processIncomingEvents } from '../ProcessIncomingEvents';

describe('applyToGameState', () => {
  let source$: Subject<IncomingEvent>;
  let gameState: GameState;

  beforeEach(() => {
    source$ = new Subject<IncomingEvent>();
    gameState = new GameState();
  });

  it('applyTos the game state duh', (done: any) => {
    const results: OutgoingEvent[] = [];

    source$
      .pipe(
        processIncomingEvents(gameState),
        take(1),
      )
      .subscribe(
        (next: OutgoingEvent) => {
          results.push(next);
        },
        (error: any) => {
          done.fail(error);
        },
        () => {
          expect(results.length).toEqual(1);
          expect(results[0].data()).toEqual({
            id: 1,
          });

          done();
        },
      );

    source$.next(new Connect(1, 'abc'));
  });
});
