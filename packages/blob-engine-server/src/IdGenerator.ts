export interface IdGenerator {
  next(): number;
}

export class DefaultIdGenerator implements IdGenerator {
  private nextId: number;

  constructor(start = 1) {
    this.nextId = start - 1;
  }

  public next(): number {
    this.nextId += 1;
    return this.nextId;
  }
}
