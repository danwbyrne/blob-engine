export interface GameEvent {
  readonly type: string;
  readonly args?: Record<string, string | number | boolean>;
}

export type GameEventHandler<T> = (state: T, event: GameEvent) => T;

export type GameEventHandlers<T> = Map<string, GameEventHandler<T>>;
