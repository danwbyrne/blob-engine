import { IncomingEvent } from '../../shared/events';
import { GameState } from '../GameState';

export class NoOpEvent implements IncomingEvent {
  public readonly id: number;
  public readonly type: string;
  public readonly data: object;

  constructor(type: string, id: number, data: object) {
    this.type = type;
    this.id = id;
    this.data = data;
  }

  public applyTo(gameState: GameState): GameState {
    return gameState;
  }
}
