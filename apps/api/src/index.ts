import { createServer } from './server.js';
import { env } from './lib/env.js';

/**
 * Main entry point for the API server
 */
async function start() {
  const server = await createServer();

  try {
    await server.listen({
      port: env.PORT,
      host: '0.0.0.0',
    });

    server.log.info(`🚀 Server listening on http://localhost:${env.PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
