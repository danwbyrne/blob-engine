import _ from 'lodash';
import { BehaviorSubject, Observable } from 'rxjs';
import { distinctUntilChanged, scan } from 'rxjs/operators';
import { GameEvent, GameEventHandler, GameStateOptions } from './types';

export class GameState<State> {
  private readonly eventHandlers: Map<string, GameEventHandler<State> | undefined>;
  private readonly state$: BehaviorSubject<State>;
  private readonly eventBus$: Observable<GameEvent>;

  public constructor(options: GameStateOptions<State>) {
    this.eventBus$ = options.eventBus$;
    this.eventHandlers = options.initialHandlers;
    this.state$ = new BehaviorSubject(options.initialState);

    this.eventBus$
      .pipe(
        scan((prevState, event) => {
          console.log('THIS IS FIRING INSIDE THE EVENT BUS');
          const handler = this.eventHandlers.get(event.name);
          if (handler !== undefined) {
            return handler(prevState, event);
          }

          return prevState;
        }, options.initialState),
        distinctUntilChanged((a, b) => _.isEqual(a, b)),
      )
      .subscribe(this.state$);
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
