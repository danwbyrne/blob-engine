import { fromEvent } from 'rxjs';
import { FromEventTarget } from 'rxjs/internal/observable/fromEvent';

const eventStreamToObservable = <T extends Event>(name: string) => (target: FromEventTarget<T>) =>
  fromEvent(target, name);

export const mouseMove$ = eventStreamToObservable<MouseEvent>('mousemove');
export const mouseDown$ = eventStreamToObservable<MouseEvent>('mousedown');
export const mouseClick$ = eventStreamToObservable<MouseEvent>('click');
export const mouseDoubleClick$ = eventStreamToObservable<MouseEvent>('dblclick');

export const keyDown$ = eventStreamToObservable<KeyboardEvent>('keydown');
export const keyUp$ = eventStreamToObservable<KeyboardEvent>('keyup');
export const keyPress$ = eventStreamToObservable<KeyboardEvent>('keypress');

export const blur$ = eventStreamToObservable<FocusEvent>('blur');
