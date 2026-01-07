import Fastify, { FastifyInstance } from 'fastify';
import socketioServer from 'fastify-socket.io';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { setupSockets } from './sockets';
import { Server } from 'socket.io';

declare module 'fastify' {
  interface FastifyInstance {
    io: Server;
  }
}

dotenv.config();

const fastify = Fastify({
  logger: true
});

fastify.register(cors, {
  origin: "*"
});

fastify.register(socketioServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

fastify.ready(err => {
  if (err) throw err;
  setupSockets(fastify.io);
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server running on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
