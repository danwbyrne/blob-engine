export interface AbstractEvent {
  readonly type: string;
  readonly args?: Record<string, string | number | boolean>;
}

export interface ConnectEvent {
  readonly type: 'connect';
  readonly args: {
    readonly socketID: string;
  };
}

export interface DisconnectEvent {
  readonly type: 'disconnect';
  readonly args: {
    readonly socketID: string;
  };
}

export type GameEvent = AbstractEvent | ConnectEvent | DisconnectEvent;

export type GameEventHandler<T, V extends GameEvent = GameEvent> = (state: T, event: V) => T;
export type GameEventHandlers<T, V extends GameEvent = GameEvent> = Map<string, GameEventHandler<T, V>>;
