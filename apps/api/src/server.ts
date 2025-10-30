import Fastify from 'fastify';
import cors from '@fastify/cors';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { env } from './lib/env.js';
import { prismaPlugin } from './plugins/prisma.js';
import { jwtPlugin } from './plugins/jwt.js';
import { errorHandlerPlugin } from './plugins/error-handler.js';

// Import modules
import { authRoutes } from './modules/auth/routes.js';
import { boardRoutes } from './modules/boards/routes.js';
import { listRoutes } from './modules/lists/routes.js';
import { cardRoutes } from './modules/cards/routes.js';
import { usersRoutes } from './modules/users/routes.js';

/**
 * Create and configure Fastify server instance
 */
export async function createServer() {
  const server = Fastify({
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport:
        env.NODE_ENV === 'development'
          ? {
              target: 'pino-pretty',
              options: {
                translateTime: 'HH:MM:ss Z',
                ignore: 'pid,hostname',
              },
            }
          : undefined,
    },
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
  }).withTypeProvider<ZodTypeProvider>();

  // Set Zod validator and serializer
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // Register CORS
  await server.register(cors, {
    origin: env.CORS_ORIGIN.split(','),
    credentials: true,
  });

  // Register plugins
  await server.register(prismaPlugin);
  await server.register(jwtPlugin);
  await server.register(errorHandlerPlugin);

  // Register routes
  await server.register(authRoutes, { prefix: '/auth' });
  await server.register(boardRoutes, { prefix: '/boards' });
  await server.register(listRoutes, { prefix: '/lists' });
  await server.register(cardRoutes, { prefix: '/cards' });
  await server.register(usersRoutes, { prefix: '/users' });

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  return server;
}
