import { KeyCombo, unless } from '@blob-engine/utils';
import { OrderedSet, Set } from 'immutable';
import { merge, Observable, Observer } from 'rxjs';
import { distinctUntilChanged, filter, scan } from 'rxjs/internal/operators';
import { map } from 'rxjs/operators';

export interface KeyEvent {
  readonly keyCode: number;
}

export const keyEventStream = (
  targetKeys: ReadonlyArray<number>,
  blur$: Observable<any>,
  keyDown$: Observable<KeyEvent>,
  keyUp$: Observable<KeyEvent>,
  isDisabled$: Observable<boolean>,
): Observable<KeyCombo> =>
  new Observable((observer: Observer<KeyCombo>) => {
    type NewKeyComboFactory = (currentKeyCombo: Set<number>) => Set<number>;
    const onlyTargetKeys = filter((event: KeyEvent) =>
      targetKeys.includes(event.keyCode),
    );

    const calculateNewKeyCombo = scan(
      (
        currentKeyCombo: Set<number>,
        createFrom: NewKeyComboFactory,
      ): Set<number> => createFrom(currentKeyCombo),
      OrderedSet.of(),
    );

    const keyComboStream: Observable<KeyCombo> = merge(
      keyDown$.pipe(
        unless(isDisabled$),
        onlyTargetKeys,
        map((event) => (currentKeyCombo: Set<number>) =>
          currentKeyCombo.add(event.keyCode),
        ),
      ),
      keyUp$.pipe(
        unless(isDisabled$),
        onlyTargetKeys,
        map((event) => (currentKeyCombo: Set<number>) =>
          currentKeyCombo.delete(event.keyCode),
        ),
      ),
      blur$.pipe(
        unless(isDisabled$),
        map(() => (currentKeyCombo: Set<number>) => currentKeyCombo.clear()),
      ),
    ).pipe(
      calculateNewKeyCombo,
      distinctUntilChanged(),
      map((newKeyCombo) => newKeyCombo.toJS()),
    );

    return keyComboStream.subscribe(observer);
  });
