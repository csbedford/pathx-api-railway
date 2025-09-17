import type { FastifyRequest } from 'fastify';
import prisma from '../lib/prisma';

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'access_token',
  'refresh_token',
  'authorization',
  'apiKey',
  'secret',
  'jwt',
  'bearer',
]);

export function redactSensitive<T>(input: T): T {
  const seen = new WeakSet();
  const redact = (val: any): any => {
    if (val === null || val === undefined) return val;
    if (typeof val !== 'object') return val;
    if (seen.has(val)) return val;
    seen.add(val);

    if (Array.isArray(val)) return val.map(redact);

    const out: any = {};
    for (const [k, v] of Object.entries(val)) {
      if (SENSITIVE_KEYS.has(k.toLowerCase())) {
        out[k] = '[REDACTED]';
      } else {
        out[k] = redact(v);
      }
    }
    return out;
  };
  return redact(input);
}

export function getEntityInfo(req: FastifyRequest): { entityType?: string; entityId?: string; action?: 'create'|'update'|'delete' } {
  const method = (req.method || 'GET').toUpperCase();
  const url = req.url || '';
  const parts = url.split('?')[0].split('/').filter(Boolean);
  // Expect pattern: /api/v1/<entity>[/<id>]
  const entitySegment = parts[2];
  const idSegment = parts[3];

  const map: Record<string, string> = {
    campaigns: 'Campaign',
    users: 'User',
    rfps: 'RFP',
  };
  const entityType = map[entitySegment];

  let action: 'create' | 'update' | 'delete' | undefined;
  if (['POST'].includes(method)) action = 'create';
  if (['PUT', 'PATCH'].includes(method)) action = 'update';
  if (['DELETE'].includes(method)) action = 'delete';

  return { entityType, entityId: idSegment, action };
}

export function diffStates(before: unknown, after: unknown): Record<string, unknown> {
  // Simple structural diff returning before/after for changed keys
  const changes: any = { before: undefined as any, after: undefined as any };
  if (before === undefined) {
    changes.after = after;
    return redactSensitive(changes);
  }
  if (after === undefined) {
    changes.before = before;
    return redactSensitive(changes);
  }

  const changed: any = {};
  const keys = new Set([...(Object.keys(before as any)), ...(Object.keys(after as any))]);
  for (const k of keys) {
    const b = (before as any)[k];
    const a = (after as any)[k];
    if (JSON.stringify(b) !== JSON.stringify(a)) {
      changed[k] = { before: b, after: a };
    }
  }
  return redactSensitive({ changed });
}

export async function writeAuditLog(entry: {
  entityType?: string;
  entityId?: string;
  action: string;
  actorId?: string;
  changes?: unknown;
  error?: string;
}): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        entityType: entry.entityType ?? 'Unknown',
        entityId: entry.entityId ?? 'unknown',
        action: entry.action,
        actorId: entry.actorId,
        changes: entry.error ? { error: entry.error, ...(entry.changes ? { changes: entry.changes } : {}) } : entry.changes ?? {},
      },
    });
  } catch (e) {
    // Swallow audit errors to never break API flow
    // eslint-disable-next-line no-console
    console.error('Failed to write audit log', e);
  }
}

export async function fetchBeforeState(entityType?: string, entityId?: string): Promise<unknown | undefined> {
  if (!entityType || !entityId) return undefined;
  try {
    switch (entityType) {
      case 'Campaign':
        return prisma.campaign.findUnique({ where: { id: entityId } });
      case 'User':
        return prisma.user.findUnique({ where: { id: entityId } });
      case 'RFP':
        return prisma.rFP.findUnique({ where: { id: entityId } });
      default:
        return undefined;
    }
  } catch {
    return undefined;
  }
}

export function createAuditContext(req: FastifyRequest) {
  const start = Date.now();
  const { entityType, entityId, action } = getEntityInfo(req);
  return {
    start,
    method: req.method,
    path: req.url,
    body: redactSensitive(req.body),
    user: (req as any).user,
    entityType,
    entityId,
    action,
    before: undefined as unknown,
  };
}

