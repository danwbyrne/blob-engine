import { Subject, Subscription } from 'rxjs';
import { scan } from 'rxjs/operators';
import { GameEvent, GameEventHandler } from './types';

export interface GameStateOptions<T> {
  readonly initialState: T;
  readonly initialHandlers: Map<string, GameEventHandler<T> | undefined>;
  readonly eventBus$: Subject<GameEvent>;
}

export class GameState<State> {
  private readonly eventHandlers: Map<string, GameEventHandler<State> | undefined>;
  private readonly mutableSubscription: Subscription | undefined;
  private mutableState: State | undefined;
  private readonly eventBus$: Subject<GameEvent>;

  public constructor(options: GameStateOptions<State>) {
    this.eventBus$ = options.eventBus$;
    this.eventHandlers = options.initialHandlers;
    this.mutableState = options.initialState;
    this.mutableSubscription = this.eventBus$.pipe(scan(this.handleEvent, options.initialState)).subscribe({
      next: (value) => (this.mutableState = value),
    });
  }

  public getState() {
    return this.mutableState;
  }

  public close() {
    if (this.mutableSubscription !== undefined) {
      this.mutableSubscription.unsubscribe();
    }
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

  private handleEvent(prevState: State, event: GameEvent) {
    const handler = this.eventHandlers.get(event.type);
    if (handler !== undefined) {
      return handler(prevState, event);
    }

    return prevState;
  }
}
