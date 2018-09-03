import { Observable } from 'rxjs/index';

export class BlobEvent {
  public static CONNECTION = (id: number): BlobEvent => new BlobEvent('np', id);
  public static DISCONNECT = (id: number): BlobEvent => new BlobEvent('dc', id);

  public readonly type: string;
  public readonly id: number;
  public readonly data: any;

  constructor(type: string, id: number, data: any = null) {
    this.type = type;
    this.id = id;
    this.data = data;
  }
}

// Saving for later

export type EventResults = Observable<BlobEvent>;

export interface EventHandler {
  key: string;
  handler: (event: BlobEvent) => EventResults;
}

//
// export class EventLogger implements EventHandler {
//   public key = 'hello';
//
//   private log: Logger;
//
//   constructor(logger: Logger) {
//     this.log = logger;
//   }
//
//   public handler = (event: BlobEvent): EventResults =>
//     new Observable<BlobEvent>((observer: Observer<BlobEvent>) => {
//       this.log(event);
//       observer.next(BlobEvent.TESTY());
//     });
// }
