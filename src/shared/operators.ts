import { Observable } from 'rxjs';
import { filter, map, withLatestFrom } from 'rxjs/operators';

export const unless = (locked$: Observable<any>) => (source$: Observable<any>) =>
  source$.pipe(
    withLatestFrom(locked$),
    filter(([_, locked]) => !locked),
    map(([event, _]) => event),
  );

export const when = (enabled: boolean) => (toggle$: Observable<any>) =>
  toggle$.pipe(filter((value) => value === enabled));
