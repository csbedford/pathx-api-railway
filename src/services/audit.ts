import prisma from '../lib/prisma';
import { diffStates } from '../middleware/audit';

export type AuditTx = typeof prisma | {
  auditLog: { create: (args: any) => Promise<any> };
};

export async function recordStateTransition(params: {
  entityType: string;
  entityId: string;
  previous: any;
  next: any;
  userId?: string;
  reason?: string;
  tx?: AuditTx;
}) {
  const { entityType, entityId, previous, next, userId, reason, tx } = params;
  const prevState = String(previous?.status ?? 'unknown');
  const nextState = String(next?.status ?? 'unknown');
  const transitionedAt = new Date().toISOString();

  const changes = {
    event: 'state_transition',
    previousState: prevState,
    newState: nextState,
    transitionedBy: userId,
    transitionedAt,
    reason,
    diff: diffStates(previous, next),
  };

  const client = (tx as any) ?? prisma;
  return client.auditLog.create({
    data: {
      entityType,
      entityId,
      action: `state_transition:${prevState}->${nextState}`,
      actorId: userId,
      changes,
    },
  });
}

export async function getStateTransitionHistory(entityType: string, entityId: string) {
  const rows = await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
      action: { startsWith: 'state_transition' },
    },
    orderBy: { timestamp: 'asc' },
  });
  return rows.map((r) => {
    const c: any = r.changes || {};
    return {
      entityType: r.entityType,
      entityId: r.entityId,
      previousState: c.previousState,
      newState: c.newState,
      transitionedBy: c.transitionedBy ?? r.actorId,
      transitionedAt: c.transitionedAt ?? (r as any).timestamp,
      reason: c.reason,
      diff: c.diff,
    };
  });
}

export default { recordStateTransition, getStateTransitionHistory };

