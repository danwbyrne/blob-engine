import { DependencyList, useEffect, useMemo, useRef, useState } from 'react';
import { Observable, Subscription } from 'rxjs';

export function useStream<T>(createStream$: () => Observable<T>, props: DependencyList, initialValue: T): T {
  const mutableSubscriptionRef = useRef<Subscription | undefined>(undefined);
  const mutableSetValueRef = useRef<((value: T) => void) | undefined>(undefined);

  // Subscribe during the first render in case there is a synchronous result.
  const first = useMemo(() => {
    if (mutableSubscriptionRef.current !== undefined) {
      mutableSubscriptionRef.current.unsubscribe();
    }

    let firstValue = initialValue;
    // tslint:disable-next-line: no-object-mutation
    mutableSubscriptionRef.current = createStream$().subscribe({
      next: (nextValue) => {
        firstValue = nextValue;
        if (mutableSetValueRef.current !== undefined) {
          mutableSetValueRef.current(nextValue);
        }
      },
    });

    return firstValue;
  }, [...props, mutableSubscriptionRef, mutableSetValueRef]);

  // Make sure we do a final cleanup of the subscription
  useEffect(
    () => () => {
      if (mutableSubscriptionRef.current !== undefined) {
        mutableSubscriptionRef.current.unsubscribe();
      }
    },
    [mutableSubscriptionRef],
  );
  const [value, setValue] = useState<T>(first);
  mutableSetValueRef.current = setValue;

  return value;
}
