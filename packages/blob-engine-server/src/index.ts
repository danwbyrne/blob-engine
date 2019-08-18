import { createServer } from './createServer';

const server = createServer({
  tickRate: 2000,
  initialState: {
    test: 'test',
  },
});

server.listen(5000, () => {
  // tslint:disable-next-line: no-console
  console.log('listening on *:5000');
});
