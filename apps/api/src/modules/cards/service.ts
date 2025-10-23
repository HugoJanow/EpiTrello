import { PrismaClient } from '@epitrello/db';
import { Errors } from '../../lib/errors.js';
import type {
  CreateCardInput,
  UpdateCardInput,
  ReorderCardInput,
  CardMemberInput,
  CardLabelInput,
} from './schemas.js';

export class CardService {
  constructor(private prisma: PrismaClient) {}

  async getCards(listId: string) {
    return this.prisma.card.findMany({
      where: { listId },
      orderBy: { order: 'asc' },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, displayName: true, avatarUrl: true },
            },
          },
        },
        labels: true,
      },
    });
  }

  async getCardById(id: string) {
    const card = await this.prisma.card.findUnique({
      where: { id },
      include: {
        list: { include: { board: true } },
        members: {
          include: {
            user: {
              select: { id: true, email: true, displayName: true, avatarUrl: true },
            },
          },
        },
        labels: true,
      },
    });
    if (!card) throw Errors.notFound('Card');
    return card;
  }

  async createCard(data: CreateCardInput) {
    const maxOrder = await this.prisma.card.aggregate({
      where: { listId: data.listId },
      _max: { order: true },
    });

    return this.prisma.card.create({
      data: {
        title: data.title,
        description: data.description,
        listId: data.listId,
        priority: data.priority,
        dueDate: data.dueDate,
        order: (maxOrder._max.order ?? 0) + 1000,
      },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, displayName: true, avatarUrl: true },
            },
          },
        },
        labels: true,
      },
    });
  }

  async updateCard(id: string, data: UpdateCardInput) {
    return this.prisma.card.update({
      where: { id },
      data,
      include: {
        members: {
          include: {
            user: {
              select: { id: true, email: true, displayName: true, avatarUrl: true },
            },
          },
        },
        labels: true,
      },
    });
  }

  async deleteCard(id: string) {
    await this.prisma.card.delete({ where: { id } });
  }

  async reorderCard(data: ReorderCardInput) {
    await this.prisma.card.update({
      where: { id: data.cardId },
      data: { listId: data.listId, order: data.newOrder },
    });
  }

  async addMember(cardId: string, data: CardMemberInput) {
    return this.prisma.cardMember.create({
      data: { cardId, userId: data.userId },
      include: {
        user: {
          select: { id: true, email: true, displayName: true, avatarUrl: true },
        },
      },
    });
  }

  async removeMember(cardId: string, userId: string) {
    await this.prisma.cardMember.deleteMany({
      where: { cardId, userId },
    });
  }

  async addLabel(cardId: string, data: CardLabelInput) {
    return this.prisma.cardLabel.create({
      data: { cardId, name: data.name, color: data.color },
    });
  }

  async removeLabel(cardId: string, labelId: string) {
    await this.prisma.cardLabel.delete({
      where: { id: labelId, cardId },
    });
  }
}
