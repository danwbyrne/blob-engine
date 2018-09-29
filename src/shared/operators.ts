import { Observable, of, pipe } from 'rxjs';
import { concatMap, filter, map, takeWhile, withLatestFrom } from 'rxjs/operators';
import { IncomingEvent } from './events';

export const unless = (locked$: Observable<any>) => (
  source$: Observable<any>,
) =>
  source$.pipe(
    withLatestFrom(locked$),
    filter(([_, locked]) => !locked),
    map(([event, _]) => event),
  );

export const eventsMatching = (type: string) =>
  pipe(filter((event: IncomingEvent) => event.type === type));

export const allUntil = (type: string) => (
  source$: Observable<IncomingEvent>,
): Observable<IncomingEvent> =>
  source$.pipe(
    concatMap(
      (next: IncomingEvent) => (next.type === type ? of(next, null) : of(next)),
    ),
    takeWhile<IncomingEvent>((next: IncomingEvent) => next !== null),
  );
