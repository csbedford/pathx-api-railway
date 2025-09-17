import { describe, it, expect, beforeEach, vi } from 'vitest';
import { recordStateTransition, getStateTransitionHistory } from '../../src/services/audit';

const db: { auditLogs: any[] } = { auditLogs: [] };

vi.mock('../../src/lib/prisma', () => {
  return {
    default: {
      auditLog: {
        async create({ data }: any) {
          const row = { id: String(db.auditLogs.length + 1), timestamp: new Date(), ...data };
          db.auditLogs.push(row);
          return row;
        },
        async findMany({ where, orderBy }: any) {
          const rows = db.auditLogs.filter(
            (r) => r.entityType === where.entityType && r.entityId === where.entityId && String(r.action).startsWith('state_transition'),
          );
          rows.sort((a, b) => (a.timestamp as any) - (b.timestamp as any));
          return rows;
        },
      },
    },
  };
});

beforeEach(() => {
  db.auditLogs = [];
});

describe('audit service - state transitions', () => {
  it('records state transition with diff and fields', async () => {
    const prev = { id: 'c1', status: 'draft', name: 'N1' };
    const next = { id: 'c1', status: 'approved', name: 'N1' };
    const row = await recordStateTransition({ entityType: 'Campaign', entityId: 'c1', previous: prev, next, userId: 'u1', reason: 'approve' });
    expect(row.action).toBe('state_transition:draft->approved');
    expect(row.changes.previousState).toBe('draft');
    expect(row.changes.newState).toBe('approved');
    expect(row.changes.transitionedBy).toBe('u1');
    expect(row.changes.reason).toBe('approve');
    expect(row.changes.diff.changed.status.before).toBe('draft');
    expect(row.changes.diff.changed.status.after).toBe('approved');
  });

  it('returns state transition history enriched', async () => {
    await recordStateTransition({ entityType: 'Campaign', entityId: 'c1', previous: { id: 'c1', status: 'draft' }, next: { id: 'c1', status: 'approved' }, userId: 'u1' });
    await recordStateTransition({ entityType: 'Campaign', entityId: 'c1', previous: { id: 'c1', status: 'approved' }, next: { id: 'c1', status: 'in_market' }, userId: 'u2' });
    const hist = await getStateTransitionHistory('Campaign', 'c1');
    expect(hist.length).toBe(2);
    expect(hist[0].previousState).toBe('draft');
    expect(hist[0].newState).toBe('approved');
    expect(hist[0].transitionedBy).toBe('u1');
    expect(hist[1].newState).toBe('in_market');
  });
});

