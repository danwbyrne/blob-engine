export interface OutgoingEvent {
  data: () => object;
}

export namespace OutgoingEvents {
  export class NewPlayer implements OutgoingEvent {
    public static create = (id: number, socketId: string) =>
      new NewPlayer(id, socketId);

    private readonly id: number;

    constructor(id: number, socketId: string) {
      this.id = id;
    }

    public data = (): object => ({
      id: this.id,
    });
  }

  export class UpdatePlayerInfo implements OutgoingEvent {
    public readonly id: number;
    public readonly type: string;

    private name: string;

    constructor(id: number, name: string) {
      this.id = id;
      this.name = name;
      this.type = 'update player';
    }

    public data = (): object => ({
      id: this.id,
      name: this.name,
    });
  }
}
