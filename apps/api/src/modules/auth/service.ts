import argon2 from 'argon2';
import { PrismaClient } from '@epitrello/db';
import { Errors } from '../../lib/errors.js';
import type { RegisterInput, LoginInput, AuthResponse } from './schemas.js';
import type { JwtPayload } from '../../plugins/jwt.js';

/**
 * Authentication service
 */
export class AuthService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Register a new user
   */
  async register(data: RegisterInput): Promise<{ userId: string }> {
    // Check if user already exists
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw Errors.conflict('User with this email already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(data.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        displayName: data.displayName,
      },
    });

    return { userId: user.id };
  }

  /**
   * Login user
   */
  async login(data: LoginInput): Promise<{ userId: string; email: string }> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw Errors.unauthorized('Invalid credentials');
    }

    // Verify password
    const valid = await argon2.verify(user.passwordHash, data.password);

    if (!valid) {
      throw Errors.unauthorized('Invalid credentials');
    }

    return { userId: user.id, email: user.email };
  }

  /**
   * Store refresh token
   */
  async storeRefreshToken(userId: string, token: string, expiresAt: Date): Promise<void> {
    await this.prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });
  }

  /**
   * Verify refresh token
   */
  async verifyRefreshToken(token: string): Promise<JwtPayload> {
    const refreshToken = await this.prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!refreshToken || refreshToken.expiresAt < new Date()) {
      throw Errors.unauthorized('Invalid or expired refresh token');
    }

    return {
      sub: refreshToken.user.id,
      email: refreshToken.user.email,
    };
  }

  /**
   * Revoke refresh token
   */
  async revokeRefreshToken(token: string): Promise<void> {
    await this.prisma.refreshToken.delete({
      where: { token },
    });
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        displayName: true,
        avatarUrl: true,
      },
    });

    if (!user) {
      throw Errors.notFound('User');
    }

    return user;
  }
}
