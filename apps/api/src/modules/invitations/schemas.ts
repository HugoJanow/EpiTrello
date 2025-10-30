import { z } from 'zod';

export const createInvitationSchema = z.object({
  identifier: z.string().min(1),
  role: z.enum(['owner', 'member', 'viewer']).default('member'),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const invitationResponseSchema = z.object({
  invitationId: z.string(),
  invitedUserId: z.string().optional(),
  invitedEmail: z.string().optional(),
  role: z.enum(['owner', 'member', 'viewer']),
});

export const invitationListItemSchema = z.object({
  id: z.string(),
  boardId: z.string(),
  invitedUserId: z.string().nullable(),
  invitedEmail: z.string().nullable(),
  inviterId: z.string(),
  role: z.enum(['owner', 'member', 'viewer']),
  status: z.enum(['PENDING', 'ACCEPTED', 'DECLINED', 'REVOKED']),
  createdAt: z.string(),
});

export const invitationListSchema = z.object({
  invitations: z.array(invitationListItemSchema),
});

export const acceptInvitationParamsSchema = z.object({
  id: z.string(),
});

export const acceptInvitationResponseSchema = z.object({
  ok: z.boolean(),
});
