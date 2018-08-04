import { merge, Observable, Subscription } from 'rxjs';
import { filter, map, share, tap } from 'rxjs/operators';
import { keyCodes } from '../shared/keyCodes';
import { unless } from '../shared/operators';

export const keyComboStream = ({
  keySet = new Set(Object(keyCodes).values),
  blur$,
  keyDown$,
  keyUp$,
  isDisabled$,
}: {
  readonly keySet?: Set<number>;
  readonly blur$: Observable<{}>;
  readonly keyDown$: Observable<{}>;
  readonly keyUp$: Observable<{}>;
  readonly isDisabled$: Observable<boolean>;
}): Observable<{}> =>
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
    const addKeyIfRelevant = (source$: Observable<any>) =>
      source$.pipe(
        filter((event) => keySet.has(event.keyCode)),
        map((event) => currentKeyCombo.add(event.keyCode)),
        filter((newKeyCombo) => !(newKeyCombo === currentKeyCombo)),
      );

    // Set up stream for keyup events
    const removeKeyIfRelevant = (source$: Observable<any>) =>
      source$.pipe(
        filter((event) => keySet.has(event.keyCode)),
        tap((event) => currentKeyCombo.delete(event.keyCode)),
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
    const comboStream = merge(_keyDown$, _keyUp$).pipe(unless(isDisabled$));

    subscription.add(
      _keyDown$.subscribe((newKeyCombo) => {
        currentKeyCombo = newKeyCombo;
      }),
    );

    subscription.add(
      _keyUp$.subscribe((newKeyCombo) => {
        currentKeyCombo = newKeyCombo;
      }),
    );

    subscription.add(comboStream.subscribe(observer));

    return subscription;
  });
