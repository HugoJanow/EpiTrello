import { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { InvitationService } from './service.js';
import {
  createInvitationSchema,
  invitationResponseSchema,
  invitationListSchema,
  acceptInvitationParamsSchema,
  acceptInvitationResponseSchema,
} from './schemas.js';

export const invitationRoutes: FastifyPluginAsync = async (server) => {
  const service = new InvitationService(server.prisma);

  // POST /boards/:id/invite - create invitation
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/boards/:id/invite',
    onRequest: [server.authenticate],
    schema: {
      body: createInvitationSchema,
      response: { 200: invitationResponseSchema },
    },
    handler: async (request, reply) => {
      const inviterId = (request.user as { sub?: string }).sub ?? '';
  const boardId = (request.params as { id: string }).id;
  const { identifier, role } = request.body as { identifier: string; role: 'owner' | 'member' | 'viewer' };

      const invitation = await service.createInvitation(boardId, identifier, role, inviterId);

      reply.send({ invitationId: invitation.id, invitedUserId: invitation.invitedUserId ?? undefined, invitedEmail: invitation.invitedEmail ?? undefined, role: role });
    },
  });

  // GET /users/me/invitations - list current user's invitations
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'GET',
    url: '/users/me/invitations',
    onRequest: [server.authenticate],
    schema: {
      response: { 200: invitationListSchema },
    },
    handler: async (request, reply) => {
      const userId = (request.user as { sub?: string }).sub ?? '';
      const invites = await service.listForUser(userId);
      const typed = invites as Array<{
        id: string;
        boardId: string;
        invitedUserId: string | null;
        invitedEmail: string | null;
        inviterId: string;
        role: string;
        status: string;
        createdAt: Date;
      }>;

      const mapped = typed.map((i) => ({
        id: i.id,
        boardId: i.boardId,
        invitedUserId: i.invitedUserId ?? null,
        invitedEmail: i.invitedEmail ?? null,
        inviterId: i.inviterId,
        // Prisma stores enum values in uppercase (e.g. 'MEMBER') — map to lowercase for API schema
        role: i.role.toLowerCase() as 'owner' | 'member' | 'viewer',
        status: i.status as 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'REVOKED',
        createdAt: i.createdAt.toISOString(),
      }));
      reply.send({ invitations: mapped });
    },
  });

  // POST /invitations/:id/accept
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/invitations/:id/accept',
    onRequest: [server.authenticate],
    schema: {
      params: acceptInvitationParamsSchema,
      response: { 200: acceptInvitationResponseSchema },
    },
    handler: async (request, reply) => {
      const userId = (request.user as { sub?: string }).sub ?? '';
  const invitationId = (request.params as { id: string }).id;
      const res = await service.acceptInvitation(invitationId, userId);
      reply.send(res);
    },
  });

  // POST /invitations/:id/decline
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/invitations/:id/decline',
    onRequest: [server.authenticate],
    schema: {
      params: acceptInvitationParamsSchema,
      response: { 200: acceptInvitationResponseSchema },
    },
    handler: async (request, reply) => {
      const userId = (request.user as { sub?: string }).sub ?? '';
  const invitationId = (request.params as { id: string }).id;
      const res = await service.declineInvitation(invitationId, userId);
      reply.send(res);
    },
  });

  // POST /invitations/:id/revoke - owner only
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/invitations/:id/revoke',
    onRequest: [server.authenticate],
    schema: {
      params: acceptInvitationParamsSchema,
      response: { 200: acceptInvitationResponseSchema },
    },
    handler: async (request, reply) => {
      const actorId = (request.user as { sub?: string }).sub ?? '';
  const invitationId = (request.params as { id: string }).id;
      const res = await service.revokeInvitation(invitationId, actorId);
      reply.send(res);
    },
  });
};
