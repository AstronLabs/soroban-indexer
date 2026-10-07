import { getEvents, getEventById, getContracts, getContractById, getLedgers, getStats } from '../db/queries.js';

export const resolvers = {
  Query: {
    events: async (_: any, args: any) => {
        const events = await getEvents({ ...args.filter, limit: args.limit, cursor: args.cursor });
        // Simplified connection formatting
        const edges = events.map((e: any) => ({ cursor: e.id.toString(), node: e }));
        return {
            edges,
            pageInfo: {
                hasNextPage: events.length === args.limit,
                endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
            }
        };
    },
    event: async (_: any, args: { id: string }) => {
        return await getEventById(args.id);
    },
    contracts: async (_: any, args: any) => {
         const contracts = await getContracts({ limit: args.limit, cursor: args.cursor });
         const edges = contracts.map((c: any) => ({ cursor: c.contract_id, node: c }));
         return {
            edges,
            pageInfo: {
                hasNextPage: contracts.length === args.limit,
                endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
            }
        };
    },
    contract: async (_: any, args: { id: string }) => {
        return await getContractById(args.id);
    },
    ledgers: async (_: any, args: any) => {
        return await getLedgers(args);
    },
    stats: async () => {
        return await getStats();
    }
  }
};
