import argon2 from 'argon2';
import type { PrismaClient } from '@prisma/client';
import type { UpdateUserInput } from './schemas.js';

export class UsersService {
  constructor(private prisma: PrismaClient) {}

  async getUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
        createdAt: true,
      },
    });
  }

  async updateUser(userId: string, data: UpdateUserInput) {
    // Only allow updating specific fields
    const payload: Partial<UpdateUserInput> = {};
    if (typeof data.displayName !== 'undefined') payload.displayName = data.displayName;
    if (typeof data.avatarUrl !== 'undefined') payload.avatarUrl = data.avatarUrl as string | null;

    return this.prisma.user.update({ where: { id: userId }, data: payload });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const valid = await argon2.verify(user.passwordHash, currentPassword);
    if (!valid) {
      throw new Error('Invalid current password');
    }

    const newHash = await argon2.hash(newPassword);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash: newHash } });

    return true;
  }

  async deleteUser(userId: string) {
    // Deleting the user will cascade to related models per Prisma schema
    return this.prisma.user.delete({ where: { id: userId } });
  }
}
