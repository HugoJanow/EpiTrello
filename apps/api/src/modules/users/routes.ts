import { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { UsersService } from './service.js';
import { updateUserSchema, userResponseSchema } from './schemas.js';
import { avatarRoute } from './avatar-route.js';

export const usersRoutes: FastifyPluginAsync = async (server) => {
  const usersService = new UsersService(server.prisma);
  type SerializedUser = {
    id: string;
    email: string;
    displayName: string;
    avatarUrl: string | null;
    createdAt: string;
  };

  function serializeUser(u: unknown): SerializedUser | null {
    if (!u) return null;
    const uu = u as { [k: string]: unknown; createdAt?: unknown };
    const createdAt = uu.createdAt;
    const createdAtStr = createdAt instanceof Date ? createdAt.toISOString() : String(createdAt ?? '');
    return {
      id: String(uu.id ?? ''),
      email: String(uu.email ?? ''),
      displayName: String(uu.displayName ?? ''),
      avatarUrl: (uu.avatarUrl as string) ?? null,
      createdAt: createdAtStr,
    };
  }

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
  if (!user) return reply.code(404).send();
  reply.send({ user: serializeUser(user) as SerializedUser });
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
  reply.send({ user: serializeUser(updated) as SerializedUser });
    },
  });

  // PUT /users/password - change current user's password
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'PUT',
    url: '/password',
    onRequest: [server.authenticate],
    schema: {
      body: (await import('./schemas.js')).changePasswordSchema,
    },
    handler: async (request, reply) => {
      const payload = request.user as { sub: string };
      const body = request.body as { currentPassword: string; newPassword: string };
      try {
        await usersService.changePassword(payload.sub, body.currentPassword, body.newPassword);
        reply.send({ ok: true });
      } catch (err) {
        reply.code(400).send({ error: { message: err instanceof Error ? err.message : 'Failed' } });
      }
    },
  });

  // DELETE /users/me - delete current user
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'DELETE',
    url: '/me',
    onRequest: [server.authenticate],
    handler: async (request, reply) => {
      const payload = request.user as { sub: string };
      await usersService.deleteUser(payload.sub);
      reply.code(204).send();
    },
  });

  // Register avatar upload sub-route
  await server.register(avatarRoute, { prefix: '' });
};
