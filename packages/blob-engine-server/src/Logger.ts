import { IncomingEvent } from '@blob-engine/utils';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export type BlobMiddleware = (
  source$: Observable<IncomingEvent>,
) => Observable<IncomingEvent>;

export type LogFn = (message?: any, ...optionalParams: any[]) => void;

export const createLogger = <T>(log: LogFn) => (source$: Observable<T>) =>
  source$.pipe(tap(log));
