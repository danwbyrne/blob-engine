import { fromEvent } from 'rxjs';
import { FromEventTarget } from 'rxjs/internal/observable/fromEvent';

export const mouseMove$ = (target: FromEventTarget<MouseEvent>) => fromEvent(target, 'mousemove');
export const mouseDown$ = (target: FromEventTarget<MouseEvent>) => fromEvent(target, 'mousedown');
export const mouseClick$ = (target: FromEventTarget<MouseEvent>) => fromEvent(target, 'click');
export const mouseDoubleClick$ = (target: FromEventTarget<MouseEvent>) => fromEvent(target, 'dblclick');

export const keyDown$ = (target: FromEventTarget<KeyboardEvent>) => fromEvent(target, 'keydown');
export const keyUp$ = (target: FromEventTarget<KeyboardEvent>) => fromEvent(target, 'keyup');
export const keyPress$ = (target: FromEventTarget<KeyboardEvent>) => fromEvent(target, 'keypress');

export const blur$ = (target: FromEventTarget<FocusEvent>) => fromEvent(target, 'blur');
