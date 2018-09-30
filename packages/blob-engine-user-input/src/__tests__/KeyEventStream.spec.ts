import { BehaviorSubject, Observable, Subject } from 'rxjs/index';
import { takeUntil } from 'rxjs/internal/operators';
import { KeyEvent, keyEventStream } from '../KeyEventStream';

describe('KeyEventStream', () => {
  let blur$: Subject<any>;
  let keyDown$: Subject<KeyEvent>;
  let keyUp$: Subject<KeyEvent>;
  let isDisabled$: Subject<boolean>;
  let keyEventStream$: Observable<number[]>;

  beforeEach(() => {
    const targetKeys = [1, 2, 3];
    blur$ = new Subject();
    keyDown$ = new Subject();
    keyUp$ = new Subject();
    isDisabled$ = new BehaviorSubject<boolean>(false);

    keyEventStream$ = keyEventStream(
      targetKeys,
      blur$,
      keyDown$,
      keyUp$,
      isDisabled$,
    );
  });

  it('adds key codes for key down events', (done) => {
    const results: number[][] = [];
    const finished$ = new Subject();

    keyEventStream$.pipe(takeUntil(finished$)).subscribe(
      (next: number[]) => {
        results.push(next);
      },
      (error: any) => {
        done.fail(error);
      },
      () => {
        expect(results).toEqual([[1], [1, 2], [1, 2, 3]]);

        done();
      },
    );

    keyDown$.next({ keyCode: 1 });
    keyDown$.next({ keyCode: 2 });
    keyDown$.next({ keyCode: 3 });
    finished$.next();
  });

  it('removes key codes for key up events', (done) => {
    const results: number[][] = [];
    const finished$ = new Subject();

    keyEventStream$.pipe(takeUntil(finished$)).subscribe(
      (next: number[]) => {
        results.push(next);
      },
      (error: any) => {
        done.fail(error);
      },
      () => {
        expect(results).toEqual([[1], [1, 2], [2], []]);

        done();
      },
    );

    keyDown$.next({ keyCode: 1 });
    keyDown$.next({ keyCode: 2 });
    keyUp$.next({ keyCode: 1 });
    keyUp$.next({ keyCode: 2 });
    finished$.next();
  });

  it('only emits if the key combination changes', (done) => {
    const results: number[][] = [];
    const finished$ = new Subject();

    keyEventStream$.pipe(takeUntil(finished$)).subscribe(
      (next: number[]) => {
        results.push(next);
      },
      (error: any) => {
        done.fail(error);
      },
      () => {
        expect(results).toEqual([[1], [1, 2], [1]]);

        done();
      },
    );

    keyDown$.next({ keyCode: 1 });
    keyDown$.next({ keyCode: 2 });
    keyDown$.next({ keyCode: 1 });
    keyDown$.next({ keyCode: 2 });
    keyUp$.next({ keyCode: 2 });
    keyUp$.next({ keyCode: 2 });
    finished$.next();
  });

  it('only emits for target keys', (done) => {
    const results: number[][] = [];
    const finished$ = new Subject();

    keyEventStream$.pipe(takeUntil(finished$)).subscribe(
      (next: number[]) => {
        results.push(next);
      },
      (error: any) => {
        done.fail(error);
      },
      () => {
        expect(results).toEqual([[1], []]);

        done();
      },
    );

    keyDown$.next({ keyCode: 1 });
    keyDown$.next({ keyCode: 8 });
    keyUp$.next({ keyCode: 3 });
    keyUp$.next({ keyCode: 1 });
    finished$.next();
  });

  it('only emits when the latest value from isDisabled$ is false', (done) => {
    const results: number[][] = [];
    const finished$ = new Subject();

    keyEventStream$.pipe(takeUntil(finished$)).subscribe(
      (next: number[]) => {
        results.push(next);
      },
      (error: any) => {
        done.fail(error);
      },
      () => {
        expect(results).toEqual([[1], [1, 2], [1, 2, 3], [2, 3], []]);

        done();
      },
    );

    keyDown$.next({ keyCode: 1 });

    isDisabled$.next(true);
    keyDown$.next({ keyCode: 2 });
    keyDown$.next({ keyCode: 3 });
    keyUp$.next({ keyCode: 1 });
    blur$.next();

    isDisabled$.next(false);
    keyDown$.next({ keyCode: 2 });
    keyDown$.next({ keyCode: 3 });
    keyUp$.next({ keyCode: 1 });
    blur$.next();

    finished$.next();
  });

  it('clears the key combination on blur (browser alt-tab)', (done) => {
    const results: number[][] = [];
    const finished$ = new Subject();

    keyEventStream$.pipe(takeUntil(finished$)).subscribe(
      (next: number[]) => {
        results.push(next);
      },
      (error: any) => {
        done.fail(error);
      },
      () => {
        expect(results).toEqual([[1], [1, 2], [1]]);

        done();
      },
    );

    keyDown$.next({ keyCode: 1 });
    keyDown$.next({ keyCode: 2 });
    keyDown$.next({ keyCode: 1 });
    keyDown$.next({ keyCode: 2 });
    keyUp$.next({ keyCode: 2 });
    keyUp$.next({ keyCode: 2 });
    finished$.next();
  });
});
