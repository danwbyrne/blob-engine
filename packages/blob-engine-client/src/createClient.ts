import io from 'socket.io-client';

export const createClient = () => io('http://localhost:5000/', { reconnection: false });
