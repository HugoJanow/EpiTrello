import { FastifyPluginAsync } from 'fastify';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { UsersService } from './service.js';

export const avatarRoute: FastifyPluginAsync = async (server) => {
  const usersService = new UsersService(server.prisma);

  server.route({
    method: 'POST',
    url: '/me/avatar',
    onRequest: [server.authenticate],
    handler: async (request, reply) => {
      // Request a single file field named 'avatar'
      const file = await request.file({ fieldName: 'avatar' }).catch(() => null);
      if (!file) {
        return reply.code(400).send({ error: { message: 'No file uploaded' } });
      }

      const payload = request.user as { sub: string };

      // Build destination
      const publicDir = new URL('../../public', import.meta.url).pathname;
      const avatarsDir = path.join(publicDir, 'uploads', 'avatars');
      try {
        fs.mkdirSync(avatarsDir, { recursive: true });
      } catch {
        // ignore
      }

      const safeName = file.filename ? file.filename.replace(/[^a-zA-Z0-9_.-]/g, '_') : 'avatar';
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;
      const dest = path.join(avatarsDir, filename);

      // Pipe file stream to disk
      await pipeline(file.file, fs.createWriteStream(dest));

      // Build a URL that will be reachable from the frontend. API is proxied at /api in dev.
      const avatarUrl = `/api/uploads/avatars/${filename}`;

      // Update user
      const updated = await usersService.updateUser(payload.sub, { avatarUrl });

      // Ensure createdAt is serialized to string
      const serialized = {
        ...updated,
        createdAt: updated.createdAt instanceof Date ? updated.createdAt.toISOString() : updated.createdAt,
      };

      return reply.send({ user: serialized });
    },
  });
};
