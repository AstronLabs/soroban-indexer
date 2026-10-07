import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import mercurius from 'mercurius';
import { config } from './config.js';
import { pool } from './db/connection.js';
import { eventsRoutes } from './routes/events.js';
import { contractsRoutes } from './routes/contracts.js';
import { ledgersRoutes } from './routes/ledgers.js';
import { healthRoutes } from './routes/health.js';
import { schema } from './graphql/schema.js';
import { resolvers } from './graphql/resolvers.js';
import { rateLimitConfig } from './middleware/rateLimit.js';

const fastify = Fastify({
  logger: {
    level: config.LOG_LEVEL,
  },
});

async function buildServer() {
  // Plugins
  await fastify.register(cors);
  await fastify.register(rateLimit, rateLimitConfig);
  
  await fastify.register(swagger, {
    swagger: {
      info: {
        title: 'Soroban Indexer API',
        description: 'API for querying indexed Soroban smart contract events and transactions',
        version: '1.0.0',
      },
      host: 'localhost',
      schemes: ['http', 'https'],
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  });

  await fastify.register(swaggerUi, {
    routePrefix: '/docs',
  });

  // GraphQL
  await fastify.register(mercurius, {
    schema,
    resolvers,
    graphiql: true,
    path: '/graphql',
  });

  // Routes
  await fastify.register(healthRoutes);
  await fastify.register(eventsRoutes, { prefix: '/api/v1/events' });
  await fastify.register(contractsRoutes, { prefix: '/api/v1/contracts' });
  await fastify.register(ledgersRoutes, { prefix: '/api/v1/ledgers' });

  // Graceful shutdown
  const listeners = ['SIGINT', 'SIGTERM'];
  for (const signal of listeners) {
    process.on(signal, async () => {
      fastify.log.info(`Received ${signal}, shutting down gracefully...`);
      await pool.end();
      await fastify.close();
      process.exit(0);
    });
  }

  return fastify;
}

buildServer()
  .then((server) => {
    server.listen({ port: config.PORT, host: config.HOST }, (err, address) => {
      if (err) {
        server.log.error(err);
        process.exit(1);
      }
      server.log.info(`Server listening at ${address}`);
    });
  })
  .catch((err) => {
    console.error('Error starting server:', err);
    process.exit(1);
  });
