import { FastifyPluginAsync } from 'fastify';
import { getLedgers, getLedgerBySequence } from '../db/queries.js';
import { LedgerQuerySchema, PaginationSchema } from '../middleware/validation.js';

export const ledgersRoutes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get('/', {
    schema: {
        querystring: LedgerQuerySchema.merge(PaginationSchema)
    }
  }, async (request, reply) => {
    const query = request.query as any;
    const ledgers = await getLedgers(query);
    return { data: ledgers };
  });

  fastify.get('/:sequence', async (request, reply) => {
    const { sequence } = request.params as { sequence: number };
    const ledger = await getLedgerBySequence(Number(sequence));
    if (!ledger) {
        return reply.status(404).send({ error: 'Ledger not found' });
    }
    return { data: ledger };
  });
  
  // Implementation for /:sequence/events would be here
};
