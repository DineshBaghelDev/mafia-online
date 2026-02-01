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

// Normalize CORS origin by removing trailing slash
const corsOrigin = (process.env.CORS_ORIGIN || "*").replace(/\/$/, '');

const fastify = Fastify({
  logger: process.env.NODE_ENV === 'production' ? false : true
});

fastify.register(cors, {
  origin: corsOrigin,
  credentials: true
});

fastify.register(socketioServer, {
  cors: {
    origin: corsOrigin,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Health check endpoint
fastify.get('/health', async (request, reply) => {
  return { 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  };
});
// API info endpoint
fastify.get('/', async (request, reply) => {
  return {
    name: 'Mafia Game Server',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      socket: 'ws://localhost:3001'
    }
  };
});
fastify.ready(err => {
  if (err) throw err;
  setupSockets(fastify.io);
  console.log('✓ Socket.IO ready');
});
const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3001');
    const host = '0.0.0.0';
    
    await fastify.listen({ port, host });
    
    console.log('');
    console.log('╔════════════════════════════════════════╗');
    console.log('║     MAFIA GAME SERVER STARTED          ║');
    console.log('╚════════════════════════════════════════╝');
    console.log('');
    console.log(`🚀 Server running on http://localhost:${port}`);
    console.log(`🔌 WebSocket ready on ws://localhost:${port}`);
    console.log(`💚 Health check: http://localhost:${port}/health`);
    console.log('');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});
process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await fastify.close();
  process.exit(0);
});
start();
