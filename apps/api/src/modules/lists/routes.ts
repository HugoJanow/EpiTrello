import { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { ListService } from './service.js';
import * as schemas from './schemas.js';

export const listRoutes: FastifyPluginAsync = async (server) => {
  const listService = new ListService(server.prisma);

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    onRequest: [server.authenticate],
    schema: { querystring: schemas.listQuerySchema },
    handler: async (request, reply) => {
      const lists = await listService.getLists(request.query.boardId);
      reply.send({ lists });
    },
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    onRequest: [server.authenticate],
    schema: { params: schemas.listParamsSchema },
    handler: async (request, reply) => {
      const list = await listService.getListById(request.params.id);
      reply.send(list);
    },
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    onRequest: [server.authenticate],
    schema: { body: schemas.createListSchema },
    handler: async (request, reply) => {
      const list = await listService.createList(request.body);
      reply.status(201).send(list);
    },
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/:id',
    onRequest: [server.authenticate],
    schema: { params: schemas.listParamsSchema, body: schemas.updateListSchema },
    handler: async (request, reply) => {
      const list = await listService.updateList(request.params.id, request.body);
      reply.send(list);
    },
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    onRequest: [server.authenticate],
    schema: { params: schemas.listParamsSchema },
    handler: async (request, reply) => {
      await listService.deleteList(request.params.id);
      reply.status(204).send();
    },
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/reorder',
    onRequest: [server.authenticate],
    schema: { body: schemas.reorderListSchema },
    handler: async (request, reply) => {
      await listService.reorderList(request.body);
      reply.status(204).send();
    },
  });
};
