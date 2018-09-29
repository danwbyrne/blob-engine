import { BlobEvent } from '@blob-engine/events'
import { EventHandler } from '@blob-engine/server';
import { Events } from './Events';

/* here is where we put the core game logic on the server-side.
I haven't really worked out how it should be split up but.
*/

interface ExampleEHOptions {
  // nothing
}

export class ExampleEventHandler extends EventHandler {


  public constructor(options?: ExampleEHOptions) {
    /* this should register all of the events with our event handler.
       then we can setup handlers for the EventHandler here.
    */
    super(Events);

    /* then I guess we describe how to handle the events here */
  }
}

/* it could also be easier if we had a way to just call a new EventHandler like: */

interface Handler {
  readonly on: (event: BlobEvent) => void;
}

const handlers: ReadonlyArray<Handler> = [];

export const exampleServerHandler = new EventHandler(Events, handlers);
