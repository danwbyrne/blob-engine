import { merge, Observable, Subscription } from 'rxjs';
import { filter, map, share } from 'rxjs/operators';
import { keyCodes } from '../shared/keyCodes';
import { unless } from '../shared/operators';

export interface KeyEvent {
  readonly keyCode: number;
}

export const keyEventStream = ({
  targetKeys = new Set(Object(keyCodes).values),
  blur$,
  keyDown$,
  keyUp$,
  isDisabled$,
}: {
  readonly targetKeys?: Set<number>;
  readonly blur$: Observable<any>;
  readonly keyDown$: Observable<KeyEvent>;
  readonly keyUp$: Observable<KeyEvent>;
  readonly isDisabled$: Observable<boolean>;
}): Observable<Set<number>> =>
  new Observable((observer) => {
    let currentKeyCombo = new Set<number>();
    const subscription = new Subscription();

    // Remove any keys in the combo when the user alt-tabs
    subscription.add(
      blur$.subscribe((_) => {
        currentKeyCombo.clear();
      }),
    );

    // Set up stream for keydown events
    const addKeyIfRelevant = (source$: Observable<KeyEvent>) =>
      source$.pipe(
        filter((event) => targetKeys.has(event.keyCode)),
        map((event) => currentKeyCombo.add(event.keyCode)),
        filter((newKeyCombo) => !(newKeyCombo === currentKeyCombo)),
      );

    // Set up stream for keyup events
    const removeKeyIfRelevant = (source$: Observable<KeyEvent>) =>
      source$.pipe(
        filter((event) => currentKeyCombo.delete(event.keyCode)),
        map((_event) => currentKeyCombo),
      );

    const _keyDown$ = keyDown$.pipe(
      addKeyIfRelevant,
      share(),
    );

    const _keyUp$ = keyUp$.pipe(
      removeKeyIfRelevant,
      share(),
    );

    // Cross the streams ԅ(≖‿≖ԅ)
    const keyComboStream = merge(_keyDown$, _keyUp$).pipe(unless(isDisabled$));

    subscription.add(
      _keyDown$.subscribe((newKeyCombo) => {
        currentKeyCombo = newKeyCombo;
      }),
    );
    subscription.add(_keyUp$.subscribe());
    subscription.add(keyComboStream.subscribe(observer));

    return subscription;
  });
