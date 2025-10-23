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
      where: { ownerId: userId },
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

    if (board.ownerId !== userId) {
      throw Errors.forbidden('You do not have access to this board');
    }

    return board;
  }

  /**
   * Create a new board
   */
  async createBoard(data: CreateBoardInput, userId: string) {
    const board = await this.prisma.board.create({
      data: {
        title: data.title,
        description: data.description,
        ownerId: userId,
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
