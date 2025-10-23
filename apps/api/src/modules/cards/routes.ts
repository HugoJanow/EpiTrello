import { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { CardService } from './service.js';
import * as schemas from './schemas.js';

export const cardRoutes: FastifyPluginAsync = async (server) => {
  const cardService = new CardService(server.prisma);

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/',
    onRequest: [server.authenticate],
    schema: { querystring: schemas.cardQuerySchema },
    handler: async (request, reply) => {
      const cards = await cardService.getCards(request.query.listId);
      reply.send({ cards });
    },
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/:id',
    onRequest: [server.authenticate],
    schema: { params: schemas.cardParamsSchema },
    handler: async (request, reply) => {
      const card = await cardService.getCardById(request.params.id);
      reply.send(card);
    },
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/',
    onRequest: [server.authenticate],
    schema: { body: schemas.createCardSchema },
    handler: async (request, reply) => {
      const card = await cardService.createCard(request.body);
      reply.status(201).send(card);
    },
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'PATCH',
    url: '/:id',
    onRequest: [server.authenticate],
    schema: { params: schemas.cardParamsSchema, body: schemas.updateCardSchema },
    handler: async (request, reply) => {
      const card = await cardService.updateCard(request.params.id, request.body);
      reply.send(card);
    },
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/:id',
    onRequest: [server.authenticate],
    schema: { params: schemas.cardParamsSchema },
    handler: async (request, reply) => {
      await cardService.deleteCard(request.params.id);
      reply.status(204).send();
    },
  });

  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/reorder',
    onRequest: [server.authenticate],
    schema: { body: schemas.reorderCardSchema },
    handler: async (request, reply) => {
      await cardService.reorderCard(request.body);
      reply.status(204).send();
    },
  });

  // Member management
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/:id/members',
    onRequest: [server.authenticate],
    schema: { params: schemas.cardParamsSchema, body: schemas.cardMemberSchema },
    handler: async (request, reply) => {
      const member = await cardService.addMember(request.params.id, request.body);
      reply.status(201).send(member);
    },
  });

  server.route({
    method: 'DELETE',
    url: '/:id/members/:userId',
    onRequest: [server.authenticate],
    handler: async (request, reply) => {
      const params = request.params as { id: string; userId: string };
      await cardService.removeMember(params.id, params.userId);
      reply.status(204).send();
    },
  });

  // Label management
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/:id/labels',
    onRequest: [server.authenticate],
    schema: { params: schemas.cardParamsSchema, body: schemas.cardLabelSchema },
    handler: async (request, reply) => {
      const label = await cardService.addLabel(request.params.id, request.body);
      reply.status(201).send(label);
    },
  });

  server.route({
    method: 'DELETE',
    url: '/:id/labels/:labelId',
    onRequest: [server.authenticate],
    handler: async (request, reply) => {
      const params = request.params as { id: string; labelId: string };
      await cardService.removeLabel(params.id, params.labelId);
      reply.status(204).send();
    },
  });
};
