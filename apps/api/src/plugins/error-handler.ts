import { FastifyPluginAsync } from 'fastify';
import fp from 'fastify-plugin';
import { ZodError } from 'zod';
import { AppError, sendError } from '../lib/errors.js';

/**
 * Global error handler plugin
 */
const errorHandlerPlugin: FastifyPluginAsync = async (server) => {
  server.setErrorHandler((error, request, reply) => {
    // Log error
    request.log.error(error);

    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: error.errors,
        },
      });
    }

    // Handle custom AppError
    if (error instanceof AppError) {
      return sendError(reply, error);
    }

    // Handle Fastify errors
    if (error.statusCode) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code || 'ERROR',
          message: error.message,
        },
      });
    }

    // Unknown error
    return sendError(reply, error);
  });

  server.log.info('✅ Error handler registered');
};

export default fp(errorHandlerPlugin);
export { errorHandlerPlugin };
