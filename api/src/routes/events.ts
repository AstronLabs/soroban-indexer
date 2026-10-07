import { FastifyPluginAsync } from 'fastify';
import { getEvents, getEventById } from '../db/queries.js';
import { EventQuerySchema, PaginationSchema } from '../middleware/validation.js';

export const eventsRoutes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get('/', {
    schema: {
        querystring: EventQuerySchema.merge(PaginationSchema)
    }
  }, async (request, reply) => {
    const query = request.query as any;
    const events = await getEvents(query);
    return { data: events };
  });

  fastify.get('/:eventId', async (request, reply) => {
    const { eventId } = request.params as { eventId: string };
    const event = await getEventById(eventId);
    if (!event) {
        return reply.status(404).send({ error: 'Event not found' });
    }
    return { data: event };
  });

  fastify.get('/stream', async (request, reply) => {
      // Stub for SSE implementation
      reply.raw.setHeader('Content-Type', 'text/event-stream');
      reply.raw.setHeader('Cache-Control', 'no-cache');
      reply.raw.setHeader('Connection', 'keep-alive');
      
      reply.raw.write('data: {"message": "connected"}\n\n');
      
      // We would need to set up listen/notify with pg here
  });
};
