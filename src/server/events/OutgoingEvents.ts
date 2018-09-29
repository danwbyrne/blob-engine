export interface OutgoingEvent {
  type: string;
  data: () => object;
}

export namespace OutgoingEvents {
  export class NewPlayer implements OutgoingEvent {
    public static create = (id: number, type = 'new player') =>
      new NewPlayer(id, type);

    public readonly type: string;
    private readonly id: number;

    constructor(id: number, type: string) {
      this.id = id;
      this.type = type;
    }

    public data = (): object => ({
      id: this.id,
    });
  }

  export class UpdatePlayerInfo implements OutgoingEvent {
    public static create = (id: number, name: string, type = 'update player') =>
      new UpdatePlayerInfo(id, name, type);

    public readonly id: number;
    public readonly type: string;

    private name: string;

    constructor(id: number, name: string, type: string) {
      this.id = id;
      this.name = name;
      this.type = type;
    }

    public data = (): object => ({
      id: this.id,
      name: this.name,
    });
  }
}
