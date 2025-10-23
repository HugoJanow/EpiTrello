import { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { BoardService } from './service.js';
import {
  createBoardSchema,
  updateBoardSchema,
  boardParamsSchema,
  boardQuerySchema,
  boardSchema,
  boardListSchema,
} from './schemas.js';

/**
 * Board routes
 */
export const boardRoutes: FastifyPluginAsync = async (server) => {
  const boardService = new BoardService(server.prisma);

  /**
   * GET /boards - Get all boards for current user
   */
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    onRequest: [server.authenticate],
    schema: {
      querystring: boardQuerySchema,
      response: {
        200: boardListSchema,
      },
    },
    handler: async (request, reply) => {
      const result = await boardService.getBoards(request.user.sub, request.query);
      reply.send(result);
    },
  });

  /**
   * GET /boards/:id - Get board by ID
   */
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    onRequest: [server.authenticate],
    schema: {
      params: boardParamsSchema,
      response: {
        200: boardSchema,
      },
    },
    handler: async (request, reply) => {
      const board = await boardService.getBoardById(request.params.id, request.user.sub);
      reply.send(board);
    },
  });

  /**
   * POST /boards - Create a new board
   */
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    onRequest: [server.authenticate],
    schema: {
      body: createBoardSchema,
      response: {
        201: boardSchema,
      },
    },
    handler: async (request, reply) => {
      const board = await boardService.createBoard(request.body, request.user.sub);
      reply.status(201).send(board);
    },
  });

  /**
   * PATCH /boards/:id - Update a board
   */
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/:id',
    onRequest: [server.authenticate],
    schema: {
      params: boardParamsSchema,
      body: updateBoardSchema,
      response: {
        200: boardSchema,
      },
    },
    handler: async (request, reply) => {
      const board = await boardService.updateBoard(
        request.params.id,
        request.body,
        request.user.sub
      );
      reply.send(board);
    },
  });

  /**
   * DELETE /boards/:id - Delete a board
   */
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    onRequest: [server.authenticate],
    schema: {
      params: boardParamsSchema,
      response: {
        204: z.null(),
      },
    },
    handler: async (request, reply) => {
      await boardService.deleteBoard(request.params.id, request.user.sub);
      reply.status(204).send();
    },
  });
};
