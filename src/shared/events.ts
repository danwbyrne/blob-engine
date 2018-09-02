import { Observable } from 'rxjs/index';

export class BlobEvent {
  public static CONNECTION = (data: any = null): BlobEvent => new BlobEvent('np', data);
  public static DISCONNECT = (data: any = null): BlobEvent => new BlobEvent('dc', data);

  public readonly type: string;
  public readonly data: any;

  constructor(type: string, data: any) {
    this.type = type;
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
