import type { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { UserRole } from '../types/auth';

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type MockUser = {
  id: string;
  email: string;
  name: string;
  roles: UserRole[];
};

// Simple mock users for development/testing
const MOCK_USERS: Record<string, { user: MockUser; password: string }> = {
  'admin@example.com': {
    user: { id: 'u-admin', email: 'admin@example.com', name: 'Admin', roles: [UserRole.admin] },
    password: 'password123',
  },
  'admin@pathx.ai': {
    user: { id: 'u-admin2', email: 'admin@pathx.ai', name: 'Admin PathX', roles: [UserRole.admin] },
    password: 'test123',
  },
  'planner@example.com': {
    user: { id: 'u-planner', email: 'planner@example.com', name: 'Planner', roles: [UserRole.planner] },
    password: 'password123',
  },
  'analyst@example.com': {
    user: { id: 'u-analyst', email: 'analyst@example.com', name: 'Analyst', roles: [UserRole.analyst] },
    password: 'password123',
  },
  'analyst@pathx.ai': {
    user: { id: 'u-analyst2', email: 'analyst@pathx.ai', name: 'Analyst PathX', roles: [UserRole.analyst] },
    password: 'test123',
  },
  'partner@example.com': {
    user: { id: 'u-partner', email: 'partner@example.com', name: 'Partner', roles: [UserRole.partner] },
    password: 'password123',
  },
};

function signAccessToken(payload: { sub: string; email: string; roles: string[] }): string {
  const secret = process.env.JWT_SECRET || 'development_secret_change_in_production';
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
}

function signRefreshToken(payload: { sub: string; email: string; roles: string[] }): string {
  const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'development_secret_change_in_production';
  return jwt.sign({ ...payload, type: 'refresh' }, secret, { expiresIn: process.env.REFRESH_EXPIRES_IN || '7d' });
}

function verifyRefreshToken(token: string): { sub: string; email: string; roles: string[] } | null {
  try {
    const secret = process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET || 'development_secret_change_in_production';
    const decoded = jwt.verify(token, secret) as jwt.JwtPayload & { sub: string; email: string; roles: string[]; type?: string };
    if (decoded.type !== 'refresh') return null;
    return { sub: decoded.sub, email: decoded.email, roles: decoded.roles };
  } catch {
    return null;
  }
}

export async function registerAuthRoutes(app: FastifyInstance) {
  // POST /api/v1/auth/login
  app.post('/api/v1/auth/login', async (req, reply) => {
    const parse = LoginSchema.safeParse(req.body);
    if (!parse.success) {
      return reply.code(400).send({ error: 'bad_request', message: 'Invalid login payload' });
    }
    const { email, password } = parse.data;

    // Mocked authentication flow
    const entry = MOCK_USERS[email.toLowerCase()];
    if (!entry || entry.password !== password) {
      return reply.code(401).send({ error: 'unauthorized', message: 'Invalid credentials' });
    }

    const roles = entry.user.roles.map((r) => r.toString());
    const accessToken = signAccessToken({ sub: entry.user.id, email: entry.user.email, roles });
    const refreshToken = signRefreshToken({ sub: entry.user.id, email: entry.user.email, roles });

    return reply.send({
      user: { id: entry.user.id, email: entry.user.email, name: entry.user.name, roles },
      accessToken,
      token: accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    });
  });

  // POST /api/v1/auth/refresh
  app.post('/api/v1/auth/refresh', async (req, reply) => {
    const token = (req.body as any)?.refreshToken as string | undefined;
    if (!token) {
      return reply.code(400).send({ error: 'bad_request', message: 'Missing refreshToken' });
    }
    const payload = verifyRefreshToken(token);
    if (!payload) {
      return reply.code(401).send({ error: 'unauthorized', message: 'Invalid refresh token' });
    }
    const accessToken = signAccessToken({ sub: payload.sub, email: payload.email, roles: payload.roles });
    return reply.send({ accessToken, tokenType: 'Bearer', expiresIn: process.env.JWT_EXPIRES_IN || '15m' });
  });
}

export default registerAuthRoutes;
