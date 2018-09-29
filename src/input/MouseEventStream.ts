import { Observable } from 'rxjs';
import { map, sampleTime } from 'rxjs/operators';

export interface MouseMoveEvent {
  readonly clientX: number;
  readonly clientY: number;
}

export const mouseEventStream = ({
  mouseMoveIn$,
  mouseDownIn$,
  rate = 100,
}: {
  mouseMoveIn$: Observable<MouseMoveEvent>;
  mouseDownIn$: Observable<{}>;
  rate: number;
}): {
  readonly mouseMove$: Observable<any>;
  readonly mouseDown$: Observable<any>;
} => ({
  mouseMove$: mouseMoveIn$.pipe(
    sampleTime(rate),
    map((event: MouseMoveEvent) => ({ x: event.clientX, y: event.clientY })),
  ),
  mouseDown$: mouseDownIn$,
});
