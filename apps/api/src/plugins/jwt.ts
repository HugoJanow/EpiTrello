import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import jwt from '@fastify/jwt';
import { env } from '../lib/env.js';

/**
 * JWT plugin - provides JWT authentication
 */
const jwtPlugin: FastifyPluginAsync = async (server) => {
  // Register JWT plugin for access tokens
  await server.register(jwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: '15m', // Access token expires in 15 minutes
    },
  });

  // Add namespace for refresh tokens
  await server.register(jwt, {
    secret: env.JWT_REFRESH_SECRET,
    namespace: 'refresh',
    jwtSign: 'refreshSign',
    jwtVerify: 'refreshVerify',
    sign: {
      expiresIn: '7d', // Refresh token expires in 7 days
    },
  });

  // Decorator for authentication
  server.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Invalid or missing token',
        },
      });
    }
  });

  server.log.info('✅ JWT plugin registered');
};

export default fp(jwtPlugin);
export { jwtPlugin };

// Augment Fastify types
declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    refreshSign: (payload: JwtPayload, options?: SignOptions) => string;
    refreshVerify: (token: string) => JwtPayload;
  }

  interface FastifyRequest {
    user: JwtPayload;
  }
}

// JWT payload interface
export interface JwtPayload {
  sub: string; // user ID
  email: string;
  iat?: number;
  exp?: number;
}
