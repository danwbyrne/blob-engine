import { Observable } from 'rxjs';

export interface GameEvent {
  readonly name: string;
  readonly args?: Record<string, string | number | boolean>;
}

export type GameEventHandler<T> = (state: T, event: GameEvent) => T;

export interface GameStateOptions<T> {
  readonly initialState: T;
  readonly initialHandlers: Map<string, GameEventHandler<T> | undefined>;
  readonly eventBus$: Observable<GameEvent>;
}
