import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { ServerEvent } from '../shared/events';

export type BlobMiddleware = (
  source$: Observable<ServerEvent>,
) => Observable<ServerEvent>;

export type LogFn = (message?: any, ...optionalParams: any[]) => void;

export const createLogger = (log: LogFn): BlobMiddleware => (
  source$: Observable<ServerEvent>,
) => source$.pipe(tap(log));
