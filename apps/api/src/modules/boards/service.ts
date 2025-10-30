import { PrismaClient } from '@epitrello/db';
import { Errors } from '../../lib/errors.js';
import type { CreateBoardInput, UpdateBoardInput, BoardQuery } from './schemas.js';


/**
 * Board service
 */
export class BoardService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get boards for a user with pagination
   */
  async getBoards(userId: string, query: BoardQuery) {
    const boards = await this.prisma.board.findMany({
      // Return boards where the user is owner OR is a member
      where: {
        OR: [
          { ownerId: userId },
          { boardMembers: { some: { userId } } },
        ],
      },
      take: query.limit + 1, // Take one more to check if there's a next page
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    const hasMore = boards.length > query.limit;
    const boardList = hasMore ? boards.slice(0, -1) : boards;
    const nextCursor = hasMore ? boards[boards.length - 2]?.id ?? null : null;

    return {
      boards: boardList,
      nextCursor,
    };
  }

  /**
   * Get board by ID
   */
  async getBoardById(id: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    if (!board) {
      throw Errors.notFound('Board');
    }

    // Allow access if the user is the owner OR is a board member
    if (board.ownerId !== userId) {
      const membership = await this.prisma.boardMember.findUnique({ where: { boardId_userId: { boardId: id, userId } } });
      if (!membership) {
        throw Errors.forbidden('You do not have access to this board');
      }
    }

    return board;
  }

  /**
   * Create a new board
   */
  async createBoard(data: CreateBoardInput, userId: string) {
    // Create board, then add owner as BOARD_MEMBER
    const createdBoard = await this.prisma.board.create({
      data: {
        title: data.title,
        description: data.description,
        ownerId: userId,
      },
      include: {
        owner: {
          select: { id: true, email: true, displayName: true },
        },
      },
    });

    // Add owner as a board member (Prisma will provide boardMember when client is regenerated)
    await this.prisma.boardMember.create({
      data: {
        boardId: createdBoard.id,
        userId,
        role: 'OWNER',
      },
    });

    return createdBoard;
  }

  /**
   * Add member to a board with a role
   */
  async addMember(boardId: string, invitedUserId: string, roleParam: 'owner' | 'member' | 'viewer', actorId: string) {
    // Ensure board exists
    const board = await this.prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw Errors.notFound('Board');

    // Only owner can invite for now
    if (board.ownerId !== actorId) throw Errors.forbidden('You do not have permissions to invite members');

    // Prevent inviting the owner as a member
    if (board.ownerId === invitedUserId) {
      throw Errors.conflict('User is already the owner');
    }

    // Check existing membership
    const existing = await this.prisma.boardMember.findUnique({ where: { boardId_userId: { boardId, userId: invitedUserId } } });
    if (existing) throw Errors.conflict('User is already a member of this board');

    const role = roleParam === 'owner' ? 'OWNER' : roleParam === 'viewer' ? 'VIEWER' : 'MEMBER';
    const member = await this.prisma.boardMember.create({
      data: {
        boardId,
        userId: invitedUserId,
        role,
      },
    });

    // Add activity log
    await this.prisma.activityLog.create({
      data: {
        boardId,
        userId: actorId,
        action: 'MEMBER_ADDED',
        metadata: { invitedUserId: invitedUserId, role },
      },
    });

    return member;
  }

  /**
   * Update a board
   */
  async updateBoard(id: string, data: UpdateBoardInput, userId: string) {
    // Check ownership
    await this.getBoardById(id, userId);

    const board = await this.prisma.board.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
    });

    return board;
  }

  /**
   * Delete a board
   */
  async deleteBoard(id: string, userId: string) {
    // Check ownership
    await this.getBoardById(id, userId);

    await this.prisma.board.delete({
      where: { id },
    });
  }
}
