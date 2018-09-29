import { BlobEvent } from '@blob-engine/events';

/* describe the events you want to go between the server and network
maybe we need to split it up between 'IncomingEvents' and 'OutgoingEvents'.
*/

const exampleEvent: BlobEvent = {};

const events = {
  exampleEvent,
}

export { events as Events };
