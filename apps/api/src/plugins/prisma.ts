import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { PrismaClient } from '@epitrello/db';

/**
 * Prisma plugin - provides database client to all routes
 */
const prismaPlugin: FastifyPluginAsync = async (server) => {
  const prisma = new PrismaClient({
    log: server.log.level === 'debug' ? ['query', 'error', 'warn'] : ['error'],
  });

  // Test connection
  await prisma.$connect();
  server.log.info('✅ Database connected');

  // Decorate Fastify instance with Prisma client
  server.decorate('prisma', prisma);

  // Close connection on server shutdown
  server.addHook('onClose', async (server) => {
    server.log.info('Disconnecting from database...');
    await server.prisma.$disconnect();
  });
};

export default fp(prismaPlugin);
export { prismaPlugin };

// Augment Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}
