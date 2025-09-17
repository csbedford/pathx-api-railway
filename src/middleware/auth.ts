import type { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';

type JwtPayload = jwt.JwtPayload & {
  sub?: string;
  roles?: unknown;
  role?: unknown;
  [k: string]: unknown;
};

type AuthUser = {
  sub?: string;
  roles: string[];
  token: string;
  claims: JwtPayload;
};

function extractBearerToken(req: FastifyRequest): string | undefined {
  const header = (req.headers['authorization'] || req.headers['Authorization']) as string | undefined;
  if (!header || !header.startsWith('Bearer ')) return undefined;
  return header.slice('Bearer '.length);
}

function extractRoles(payload: JwtPayload): string[] {
  const fromRoles = payload.roles;
  if (Array.isArray(fromRoles)) return fromRoles.map(String);
  if (typeof fromRoles === 'string') return [fromRoles];
  const fromRole = payload.role;
  if (Array.isArray(fromRole)) return fromRole.map(String);
  if (typeof fromRole === 'string') return [fromRole];
  return [];
}

export async function authenticate(req: FastifyRequest, reply: FastifyReply): Promise<void> {
  try {
    const token = extractBearerToken(req);
    if (!token) {
      reply.code(401).send({ error: 'unauthorized', message: 'Missing bearer token' });
      return;
    }

    const secret = process.env.JWT_SECRET || 'development_secret_change_in_production';
    const payload = jwt.verify(token, secret) as JwtPayload;

    const roles = extractRoles(payload);
    (req as any).user = {
      sub: payload.sub,
      roles,
      token,
      claims: payload,
    };
  } catch (err) {
    reply.code(401).send({ error: 'unauthorized', message: 'Invalid token' });
  }
}

export function requireRole(requiredRole: string) {
  return async function requireRoleHandler(req: FastifyRequest, reply: FastifyReply): Promise<void> {
    const user = (req as any).user as AuthUser | undefined;
    if (!user) {
      reply.code(401).send({ error: 'unauthorized', message: 'Authentication required' });
      return;
    }
    const roles = user.roles || [];
    if (!roles.includes(requiredRole) && !roles.includes('admin')) {
      reply.code(403).send({ error: 'forbidden', message: 'Insufficient role' });
      return;
    }
  };
}

export default { authenticate, requireRole };
