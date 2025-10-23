import { FastifyReply } from 'fastify';

/**
 * Standard API error response structure
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

/**
 * Custom error class for API errors
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 500,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Send a standardized error response
 */
export function sendError(
  reply: FastifyReply,
  error: AppError | Error,
  statusCode?: number
): FastifyReply {
  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    } satisfies ApiError);
  }

  // Unknown error
  return reply.status(statusCode ?? 500).send({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: error.message || 'An unexpected error occurred',
    },
  } satisfies ApiError);
}

/**
 * Common error factories
 */
export const Errors = {
  unauthorized: (message = 'Unauthorized') =>
    new AppError('UNAUTHORIZED', message, 401),
  
  forbidden: (message = 'Forbidden') =>
    new AppError('FORBIDDEN', message, 403),
  
  notFound: (resource: string) =>
    new AppError('NOT_FOUND', `${resource} not found`, 404),
  
  badRequest: (message: string, details?: Record<string, unknown>) =>
    new AppError('BAD_REQUEST', message, 400, details),
  
  conflict: (message: string) =>
    new AppError('CONFLICT', message, 409),
  
  validation: (details: Record<string, unknown>) =>
    new AppError('VALIDATION_ERROR', 'Validation failed', 400, details),
};
