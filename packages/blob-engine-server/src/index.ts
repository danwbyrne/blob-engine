import { createServer } from './createServer';

const server = createServer();

server.listen(5000, () => {
  // tslint:disable-next-line: no-console
  console.log('listening on *:5000');
});
