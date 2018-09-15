import { Observable, pipe } from 'rxjs';
import { filter, first, map, withLatestFrom } from 'rxjs/operators';
import { BlobEvent, IncomingEvent } from './events';

export const unless = (locked$: Observable<any>) => (
  source$: Observable<any>,
) =>
  source$.pipe(
    withLatestFrom(locked$),
    filter(([_, locked]) => !locked),
    map(([event, _]) => event),
  );

export const when = (enabled: boolean) => (toggle$: Observable<any>) =>
  toggle$.pipe(filter((value) => value === enabled));

export const eventsMatching = (type: string) =>
  pipe(filter((event: IncomingEvent) => event.type === type));

export const firstMatching = <T extends BlobEvent>(type: string) => (source$: Observable<T>): Observable<T> =>
  source$.pipe(
    filter((event: T) => event.type === type),
    first(),
  );
