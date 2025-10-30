import type { PrismaClient } from '@prisma/client';
import type { UpdateUserInput } from './schemas.js';

export class UsersService {
  constructor(private prisma: PrismaClient) {}

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async updateUser(userId: string, data: UpdateUserInput) {
    // Only allow updating specific fields
    const payload: Partial<UpdateUserInput> = {};
    if (typeof data.displayName !== 'undefined') payload.displayName = data.displayName;
    if (typeof data.avatarUrl !== 'undefined') payload.avatarUrl = data.avatarUrl as string | null;

    return this.prisma.user.update({ where: { id: userId }, data: payload });
  }
}
