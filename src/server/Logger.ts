import { Observable } from 'rxjs';
import { BlobEvent } from '../shared/events';
import { tap } from 'rxjs/operators';

export type BlobMiddleware = (source$: Observable<BlobEvent>) => Observable<BlobEvent>;
export type LogFn = (message?: any, ...optionalParams: any[]) => void;

export const createLogger = (log: LogFn): BlobMiddleware => (source$: Observable<BlobEvent>) =>
  source$.pipe(
    tap(log),
  );
