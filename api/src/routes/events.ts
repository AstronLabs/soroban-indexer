import {
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest,
} from 'fastify';
import { getEvents, getEventById } from '../db/queries.js';
import { EventQuerySchema, PaginationSchema } from '../middleware/validation.js';

export const startSSEHeartbeat = (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  reply.raw.write('data: {"message": "connected"}\n\n');

  const heartbeat = setInterval(() => {
    reply.raw.write(':ping\n\n');
  }, 15_000);

  request.raw.on('close', () => {
    clearInterval(heartbeat);
  });

  return heartbeat;
};

export const eventsRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get(
    '/',
    {
      schema: {
        querystring: EventQuerySchema.merge(PaginationSchema),
      },
    },
    async (request, reply) => {
      const query = request.query as any;
      const events = await getEvents(query);
      return { data: events };
    }
  );

  fastify.get('/:eventId', async (request, reply) => {
    const { eventId } = request.params as { eventId: string };
    const event = await getEventById(eventId);

    if (!event) {
      return reply.status(404).send({ error: 'Event not found' });
    }

    return { data: event };
  });

  fastify.get('/stream', async (request, reply) => {
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');

    startSSEHeartbeat(request, reply);
  });
};