import { PrismaClient } from '@epitrello/db';
import { Errors } from '../../lib/errors.js';
import type { CreateListInput, UpdateListInput, ReorderListInput } from './schemas.js';

export class ListService {
  constructor(private prisma: PrismaClient) {}

  async getLists(boardId: string) {
    return this.prisma.list.findMany({
      where: { boardId },
      orderBy: { order: 'asc' },
    });
  }

  async getListById(id: string) {
    const list = await this.prisma.list.findUnique({
      where: { id },
      include: { board: true },
    });
    if (!list) throw Errors.notFound('List');
    return list;
  }

  async createList(data: CreateListInput) {
    const maxOrder = await this.prisma.list.aggregate({
      where: { boardId: data.boardId },
      _max: { order: true },
    });

    return this.prisma.list.create({
      data: {
        title: data.title,
        boardId: data.boardId,
        order: (maxOrder._max.order ?? 0) + 1000,
      },
    });
  }

  async updateList(id: string, data: UpdateListInput) {
    return this.prisma.list.update({
      where: { id },
      data,
    });
  }

  async deleteList(id: string) {
    await this.prisma.list.delete({ where: { id } });
  }

  async reorderList(data: ReorderListInput) {
    await this.prisma.list.update({
      where: { id: data.listId },
      data: { order: data.newOrder },
    });
  }
}
