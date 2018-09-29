import { Observable, pipe } from 'rxjs';
import { filter, first, map, withLatestFrom } from 'rxjs/operators';
import { BlobEvent } from './events';

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
  pipe(filter((event: BlobEvent) => event.type === type));

export const firstMatching = (type: string) =>
  pipe(
    eventsMatching(type),
    first(),
  );
