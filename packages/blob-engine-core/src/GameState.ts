import debug from 'debug';
import _ from 'lodash';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { distinctUntilChanged, scan } from 'rxjs/operators';
import { GameEvent, GameEventHandler } from './types';

const log = debug('blob-engine:game-state');

export interface GameStateOptions<T> {
  readonly initialState: T;
  readonly initialHandlers: Map<string, GameEventHandler<T> | undefined>;
  readonly eventBus$: Observable<GameEvent>;
}

export class GameState<State> {
  private readonly eventHandlers: Map<string, GameEventHandler<State> | undefined>;
  private readonly initialState: State;
  private mutableSubscription: Subscription | undefined;
  private readonly state$: BehaviorSubject<State>;
  private readonly eventBus$: Observable<GameEvent>;

  public constructor(options: GameStateOptions<State>) {
    this.eventBus$ = options.eventBus$;
    this.eventHandlers = options.initialHandlers;
    this.initialState = options.initialState;
    this.state$ = new BehaviorSubject(this.initialState);
  }

  public init() {
    this.mutableSubscription = this.eventBus$
      .pipe(
        scan((prevState, event) => {
          log('event bus firing: %o', event);
          const handler = this.eventHandlers.get(event.name);
          log('maybe got a handler?: %o', handler);
          if (handler !== undefined) {
            return handler(prevState, event);
          }

          return prevState;
        }, this.initialState),
      )
      .subscribe(this.state$);
  }

  public close() {
    if (this.mutableSubscription !== undefined) {
      this.mutableSubscription.unsubscribe();
    }
  }

  public getState() {
    return this.state$.getValue();
  }

  public registerEventHandler(name: string, handler: GameEventHandler<State>) {
    if (this.eventHandlers.get(name)) {
      throw new Error(`A handler for event ${name} is already registered`);
    }

    this.eventHandlers.set(name, handler);
  }

  public unRegisterEventHandler(name: string) {
    try {
      this.eventHandlers.delete(name);
    } catch {
      // do nothing
    }
  }
}
