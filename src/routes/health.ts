import type { FastifyInstance } from 'fastify';
import { appConfig } from '../config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function getVersion(): string {
  // Try to resolve package.json relative to compiled output and fallback
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    // src/routes -> src -> service root | dist/routes -> dist -> service root
    const candidate = path.resolve(__dirname, '..', '..', 'package.json');
    if (fs.existsSync(candidate)) {
      const pkg = JSON.parse(fs.readFileSync(candidate, 'utf8')) as { version?: string };
      return pkg.version ?? '0.0.1';
    }
  } catch {
    // ignore and fallback
  }

  // Final fallback
  return '0.0.1';
}

export async function registerHealthRoutes(app: FastifyInstance) {
  app.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: getVersion(),
      environment: appConfig.NODE_ENV,
    };
  });

  // Keep readiness for compatibility with existing tooling
  app.get('/ready', async () => ({ status: 'ready' }));
}
