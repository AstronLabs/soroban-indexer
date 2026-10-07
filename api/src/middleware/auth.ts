import { FastifyRequest, FastifyReply } from 'fastify';
import { config } from '../config.js';

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  if (!config.API_KEY_ENABLED) {
    return;
  }

  const apiKey = request.headers['x-api-key'];

  if (!apiKey || apiKey !== config.API_KEY) {
    reply.status(401).send({ error: 'Unauthorized' });
  }
}
