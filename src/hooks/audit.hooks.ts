import type { FastifyInstance, FastifyReply, FastifyRequest, preHandlerHookHandler, onSendHookHandler } from 'fastify';
import { createAuditContext, diffStates, fetchBeforeState, writeAuditLog, redactSensitive } from '../middleware/audit';

export function registerAuditHooks(app: FastifyInstance) {
  app.addHook('preHandler', auditPreHandler);
  app.addHook('onSend', auditOnSend);
}

export const auditPreHandler: preHandlerHookHandler = async (req) => {
  const ctx = createAuditContext(req);
  // For updates/deletes, fetch current state to diff later
  if (ctx.action === 'update' || ctx.action === 'delete') {
    ctx.before = await fetchBeforeState(ctx.entityType, ctx.entityId);
  }
  (req as any).auditContext = ctx;
};

export const auditOnSend: onSendHookHandler = async (req: FastifyRequest, reply: FastifyReply, payload: any) => {
  const ctx = (req as any).auditContext as undefined | {
    start: number;
    method: string;
    path: string;
    body: unknown;
    user?: { sub?: string };
    entityType?: string;
    entityId?: string;
    action?: 'create' | 'update' | 'delete';
    before?: unknown;
  };
  const durationMs = Date.now() - (ctx?.start ?? Date.now());
  const status = reply.statusCode;

  // Parse JSON payload if available
  let responseJson: any = undefined;
  try {
    if (typeof payload === 'string') responseJson = JSON.parse(payload);
    else if (Buffer.isBuffer(payload)) responseJson = JSON.parse(payload.toString('utf8'));
  } catch {
    // ignore non-JSON responses
  }

  const actorId = ctx?.user?.sub && typeof ctx.user.sub === 'string' ? ctx.user.sub : undefined;

  // Log errors for any failed request
  if (status >= 400) {
    const message = typeof responseJson?.message === 'string' ? responseJson.message : `HTTP ${status}`;
    await writeAuditLog({
      entityType: ctx?.entityType ?? 'Unknown',
      entityId: ctx?.entityId ?? 'unknown',
      action: 'error',
      actorId,
      changes: { request: ctx?.body, status, durationMs },
      error: message,
    });
    return payload;
  }

  // Only log mutations
  if (!ctx?.action) return payload;

  let changes: unknown = undefined;
  if (ctx.action === 'create') {
    // For creates, log resulting entity if present
    changes = diffStates(undefined, responseJson);
  } else if (ctx.action === 'update') {
    changes = diffStates(ctx.before, responseJson ?? redactSensitive(req.body));
  } else if (ctx.action === 'delete') {
    changes = diffStates(ctx.before, undefined);
  }

  await writeAuditLog({
    entityType: ctx.entityType,
    entityId: ctx.entityId ?? (responseJson?.id as string | undefined),
    action: ctx.action,
    actorId,
    changes,
  });

  return payload;
};

