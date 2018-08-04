import { fromEvent } from 'rxjs';

export const windowSources = {
  keyDown$: fromEvent(window, 'keydown'),
  keyUp$: fromEvent(window, 'keyup'),
  blur$: fromEvent(window, 'blur'),
  mouseMove$: fromEvent(window, 'mousemove'),
  mouseDown$: fromEvent(window, 'mousedown'),
};
