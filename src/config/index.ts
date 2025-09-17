import { config as loadEnv } from 'dotenv';
import { z } from 'zod';
import path from 'node:path';
import fs from 'node:fs';

// Load environment variables from .env if present
loadEnv();

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // Accept string or number for PORT and normalize to string
  // Default must be a string per requirements
  PORT: z.coerce.string().default('3001'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  API_PREFIX: z.string().default('/api/v1'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_DB: z.coerce.number().default(0),
  CACHE_TTL: z.coerce.number().default(300), // 5 minutes default cache TTL
});

export type AppConfig = z.infer<typeof EnvSchema> & { version: string };

function readPackageVersion(): string {
  try {
    const pkgPath = path.resolve(process.cwd(), 'services', 'api', 'package.json');
    const fallbackPath = path.resolve(process.cwd(), 'package.json');
    const file = fs.existsSync(pkgPath) ? pkgPath : fallbackPath;
    const pkg = JSON.parse(fs.readFileSync(file, 'utf8')) as { version?: string };
    return pkg.version ?? '0.0.0';
  } catch {
    return '0.0.0';
  }
}

const parsed = EnvSchema.safeParse(process.env);
if (!parsed.success) {
  // eslint-disable-next-line no-console
  console.error('Invalid environment configuration:', parsed.error.flatten());
  process.exit(1);
}

export const appConfig: AppConfig = { ...parsed.data, version: readPackageVersion() };
