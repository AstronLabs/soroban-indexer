import { FastifyPluginAsync } from 'fastify';
import { pool } from '../db/connection.js';

export const healthRoutes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get('/health', async (request, reply) => {
    try {
        await pool.query('SELECT 1');
        return { status: 'ok', db: 'connected' };
    } catch (e) {
        reply.status(503).send({ status: 'error', db: 'disconnected' });
    }
  });

  fastify.get('/health/ready', async (request, reply) => {
      // Check if DB is ready
      try {
        await pool.query('SELECT 1');
        return { status: 'ready' };
      } catch (e) {
        reply.status(503).send({ status: 'not ready' });
      }
  });

  fastify.get('/health/live', async (request, reply) => {
      // Liveness probe just needs to know the process is running
      return { status: 'live' };
  });
};
