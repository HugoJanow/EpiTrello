import { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { UsersService } from './service.js';
import { updateUserSchema, userResponseSchema } from './schemas.js';
import { avatarRoute } from './avatar-route.js';

export const usersRoutes: FastifyPluginAsync = async (server) => {
  const usersService = new UsersService(server.prisma);

  // GET /users/me - return current user
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/me',
    onRequest: [server.authenticate],
    schema: {
      response: {
        200: userResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const payload = request.user as { sub: string; email: string };
      const user = await usersService.getUserById(payload.sub);
      reply.send({ user });
    },
  });

  // PUT /users/me - update current user
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/me',
    onRequest: [server.authenticate],
    schema: {
      body: updateUserSchema,
      response: {
        200: userResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const payload = request.user as { sub: string; email: string };
      const updated = await usersService.updateUser(payload.sub, request.body);
      reply.send({ user: updated });
    },
  });

  // Register avatar upload sub-route
  await server.register(avatarRoute, { prefix: '' });
};
