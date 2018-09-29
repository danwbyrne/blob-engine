import { BlobClient, BlobObject } from '@blob-engine/client';
import { BlobEvent } from '@blob-engine/events';
import { Events } from './Events';

interface ExampleState {
  readonly objects: {
    [key in string]: BlobObject;
  }
}

export class ExampleClient extends BlobClient {

  private state: ExampleState;

  public constructor(state: ExampleState) {
    /* this registers the events for with our Client Handler */
    super(Events);
    this.state = state;

    this.addHandler((event: BlobEvent) => {
      // some shit
    })
  }

  /* here you register an event handler for all of your events
     that you want to affect client state. We need it a BIT seperate
     since local/network events are going to be happening async of each other.
     but that is for us to figure out.
  */
}
