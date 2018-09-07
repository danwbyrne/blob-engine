import { merge, Observable, Observer } from 'rxjs';
import { map } from 'rxjs/operators';
import { unless } from '../shared/operators';
import { distinctUntilChanged, filter, scan } from 'rxjs/internal/operators';
import { OrderedSet, Set } from 'immutable';

export interface KeyEvent {
  readonly keyCode: number;
}

export const keyEventStream = (
  targetKeys: number[],
  blur$: Observable<any>,
  keyDown$: Observable<KeyEvent>,
  keyUp$: Observable<KeyEvent>,
  isDisabled$: Observable<boolean>,
): Observable<number[]> =>
  new Observable((observer: Observer<number[]>) => {
    type NewKeyComboFactory = (currentKeyCombo: Set<number>) => Set<number>;
    const onlyTargetKeys = filter((event: KeyEvent) =>
      targetKeys.includes(event.keyCode),
    );

    const _keyDown$: Observable<NewKeyComboFactory> = keyDown$.pipe(
      unless(isDisabled$),
      onlyTargetKeys,
      map((event: KeyEvent) => (currentKeyCombo: Set<number>) =>
        currentKeyCombo.add(event.keyCode),
      ),
    );

    const _keyUp$: Observable<NewKeyComboFactory> = keyUp$.pipe(
      unless(isDisabled$),
      onlyTargetKeys,
      map((event: KeyEvent) => (currentKeyCombo: Set<number>) =>
        currentKeyCombo.delete(event.keyCode),
      ),
    );

    const _blur$: Observable<NewKeyComboFactory> = blur$.pipe(
      unless(isDisabled$),
      map((event: any) => (currentKeyCombo: Set<number>) =>
        currentKeyCombo.clear(),
      ),
    );

    const calculateNewKeyCombo = scan(
      (
        currentKeyCombo: Set<number>,
        createFrom: NewKeyComboFactory,
      ): Set<number> => createFrom(currentKeyCombo),
      OrderedSet.of(),
    );

    const keyComboStream: Observable<number[]> = merge(
      _keyDown$,
      _keyUp$,
      _blur$,
    ).pipe(
      calculateNewKeyCombo,
      distinctUntilChanged(),
      map((newKeyCombo: Set<number>) => newKeyCombo.toJS()),
    );

    return keyComboStream.subscribe(observer);
  });
