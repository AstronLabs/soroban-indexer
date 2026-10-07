import { FastifyPluginAsync } from 'fastify';
import { getContracts, getContractById, getContractEvents } from '../db/queries.js';
import { ContractQuerySchema, PaginationSchema } from '../middleware/validation.js';

export const contractsRoutes: FastifyPluginAsync = async (fastify, opts) => {
  fastify.get('/', {
    schema: {
        querystring: PaginationSchema
    }
  }, async (request, reply) => {
    const query = request.query as any;
    const contracts = await getContracts(query);
    return { data: contracts };
  });

  fastify.get('/:contractId', async (request, reply) => {
    const { contractId } = request.params as { contractId: string };
    const contract = await getContractById(contractId);
    if (!contract) {
        return reply.status(404).send({ error: 'Contract not found' });
    }
    return { data: contract };
  });

  fastify.get('/:contractId/events', {
    schema: {
        querystring: PaginationSchema
    }
  }, async (request, reply) => {
    const { contractId } = request.params as { contractId: string };
    const query = request.query as any;
    const events = await getContractEvents(contractId, query);
    return { data: events };
  });
};
