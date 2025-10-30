import { PrismaClient } from '@epitrello/db';
import { Errors } from '../../lib/errors.js';

export class InvitationService {
  constructor(private prisma: PrismaClient) {}

  async createInvitation(boardId: string, identifier: string, roleParam: 'owner' | 'member' | 'viewer', inviterId: string) {
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw Errors.notFound('Board');
    if (board.ownerId !== inviterId) throw Errors.forbidden('You do not have permissions to invite members');

    // Try to resolve user by email or displayName
    const user = await this.prisma.user.findFirst({ where: { OR: [{ email: identifier }, { displayName: identifier }] } });

    const invitedUserId = user?.id ?? null;
    const invitedEmail = user ? null : identifier;

    // prevent inviting owner
    if (invitedUserId && invitedUserId === board.ownerId) throw Errors.conflict('User is already the owner');

    // Check existing membership
    if (invitedUserId) {
      const existing = await this.prisma.boardMember.findUnique({ where: { boardId_userId: { boardId, userId: invitedUserId } } });
      if (existing) throw Errors.conflict('User is already a member of this board');
    }

    const role = roleParam === 'owner' ? 'OWNER' : roleParam === 'viewer' ? 'VIEWER' : 'MEMBER';

    const invitation = await this.prisma.boardInvitation.create({
      data: {
        boardId,
        invitedUserId: invitedUserId ?? undefined,
        invitedEmail: invitedEmail ?? undefined,
        inviterId,
        role,
      },
    });

    return invitation;
  }

  async listForUser(userId: string) {
    // Return invitations where invitedUserId matches OR invitedEmail matches user's email
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Errors.notFound('User');

    const invites = await this.prisma.boardInvitation.findMany({
      where: {
        // only return pending invitations for the current user
        status: 'PENDING',
        OR: [{ invitedUserId: userId }, { invitedEmail: user.email }],
      },
      orderBy: { createdAt: 'desc' },
    });

    return invites;
  }

  async acceptInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.boardInvitation.findUnique({ where: { id: invitationId } });
    if (!invitation) throw Errors.notFound('Invitation');
    if (invitation.status !== 'PENDING') throw Errors.conflict('Invitation is not pending');

    // Verify user is the invited user
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Errors.notFound('User');

    const matches = (invitation.invitedUserId && invitation.invitedUserId === userId) || (invitation.invitedEmail && invitation.invitedEmail === user.email);
    if (!matches) throw Errors.forbidden('You are not the invited user');

    // Ensure membership does not already exist
    const existing = await this.prisma.boardMember.findUnique({ where: { boardId_userId: { boardId: invitation.boardId, userId } } });
    if (!existing) {
      await this.prisma.boardMember.create({ data: { boardId: invitation.boardId, userId, role: invitation.role } });
    }

    await this.prisma.boardInvitation.update({ where: { id: invitationId }, data: { status: 'ACCEPTED' } });

    await this.prisma.activityLog.create({ data: { boardId: invitation.boardId, userId, action: 'MEMBER_ADDED', metadata: { invitationId, inviterId: invitation.inviterId, role: invitation.role } } });

    return { ok: true };
  }

  async declineInvitation(invitationId: string, userId: string) {
    const invitation = await this.prisma.boardInvitation.findUnique({ where: { id: invitationId } });
    if (!invitation) throw Errors.notFound('Invitation');
    if (invitation.status !== 'PENDING') throw Errors.conflict('Invitation is not pending');

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw Errors.notFound('User');

    const matches = (invitation.invitedUserId && invitation.invitedUserId === userId) || (invitation.invitedEmail && invitation.invitedEmail === user.email);
    if (!matches) throw Errors.forbidden('You are not the invited user');

    await this.prisma.boardInvitation.update({ where: { id: invitationId }, data: { status: 'DECLINED' } });

    return { ok: true };
  }

  async revokeInvitation(invitationId: string, actorId: string) {
    const invitation = await this.prisma.boardInvitation.findUnique({ where: { id: invitationId } });
    if (!invitation) throw Errors.notFound('Invitation');

    // Only board owner can revoke
    const board = await this.prisma.board.findUnique({ where: { id: invitation.boardId } });
    if (!board) throw Errors.notFound('Board');
    if (board.ownerId !== actorId) throw Errors.forbidden('You do not have permissions to revoke this invitation');

    await this.prisma.boardInvitation.update({ where: { id: invitationId }, data: { status: 'REVOKED' } });

    return { ok: true };
  }
}
