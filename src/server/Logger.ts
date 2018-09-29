import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { IncomingEvent } from '../shared/events';

export type BlobMiddleware = (
  source$: Observable<IncomingEvent>,
) => Observable<IncomingEvent>;

export type LogFn = (message?: any, ...optionalParams: any[]) => void;

export const createLogger = (log: LogFn): BlobMiddleware => (
  source$: Observable<IncomingEvent>,
) => source$.pipe(tap(log));
