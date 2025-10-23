import { FastifyPluginAsync } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { AuthService } from './service.js';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  authResponseSchema,
  type AuthResponse,
} from './schemas.js';

/**
 * Auth routes
 */
export const authRoutes: FastifyPluginAsync = async (server) => {
  const authService = new AuthService(server.prisma);

  /**
   * POST /auth/register - Register a new user
   */
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/register',
    schema: {
      body: registerSchema,
      response: {
        201: authResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { userId } = await authService.register(request.body);

      // Get user data
      const user = await authService.getUserById(userId);

      // Generate tokens
      const accessToken = server.jwt.sign(
        {
          sub: user.id,
          email: user.email,
        },
        { expiresIn: '15m' }
      );

      const refreshToken = server.jwt.sign(
        {
          sub: user.id,
          email: user.email,
        },
        { expiresIn: '7d' }
      );

      // Store refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days
      await authService.storeRefreshToken(user.id, refreshToken, expiresAt);

      reply.status(201).send({
        user,
        accessToken,
        refreshToken,
      } satisfies AuthResponse);
    },
  });

  /**
   * POST /auth/login - Login user
   */
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/login',
    schema: {
      body: loginSchema,
      response: {
        200: authResponseSchema,
      },
    },
    handler: async (request, reply) => {
      const { userId } = await authService.login(request.body);

      // Get user data
      const user = await authService.getUserById(userId);

      // Generate tokens
      const accessToken = server.jwt.sign(
        {
          sub: user.id,
          email: user.email,
        },
        { expiresIn: '15m' }
      );

      const refreshToken = server.jwt.sign(
        {
          sub: user.id,
          email: user.email,
        },
        { expiresIn: '7d' }
      );

      // Store refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await authService.storeRefreshToken(user.id, refreshToken, expiresAt);

      reply.send({
        user,
        accessToken,
        refreshToken,
      } satisfies AuthResponse);
    },
  });

  /**
   * POST /auth/refresh - Refresh access token
   */
  server.withTypeProvider<ZodTypeProvider>().route({
    method: 'POST',
    url: '/refresh',
    schema: {
      body: refreshSchema,
      response: {
        200: authResponseSchema,
      },
    },
    handler: async (request, reply) => {
      // Verify refresh token
      const payload = await authService.verifyRefreshToken(request.body.refreshToken);

      // Get user data
      const user = await authService.getUserById(payload.sub);

      // Generate new tokens
      const accessToken = server.jwt.sign(
        {
          sub: user.id,
          email: user.email,
        },
        { expiresIn: '15m' }
      );

      const refreshToken = server.jwt.sign(
        {
          sub: user.id,
          email: user.email,
        },
        { expiresIn: '7d' }
      );

      // Revoke old refresh token
      await authService.revokeRefreshToken(request.body.refreshToken);

      // Store new refresh token
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);
      await authService.storeRefreshToken(user.id, refreshToken, expiresAt);

      reply.send({
        user,
        accessToken,
        refreshToken,
      } satisfies AuthResponse);
    },
  });

  /**
   * GET /auth/me - Get current user
   */
  server.route({
    method: 'GET',
    url: '/me',
    onRequest: [server.authenticate],
    handler: async (request, reply) => {
      const payload = request.user as { sub: string; email: string };
      const user = await authService.getUserById(payload.sub);
      reply.send({ user });
    },
  });
};
