import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validateTransition, transitionState } from '../../src/services/stateTransition';
import { ControlSpaceState } from '../../src/types/stateMachine';
import { UserRole } from '../../src/types/auth';

// In-memory mock database
type Campaign = { id: string; status: string; name?: string };
type RFP = { id: string; status: string };

const db = {
  campaigns: new Map<string, Campaign>(),
  rfps: new Map<string, RFP>(),
  auditLogs: [] as any[],
};

// Mock prisma client used by the service
vi.mock('../../src/lib/prisma', () => {
  const tx = {
    campaign: {
      async findUnique({ where: { id } }: any) {
        return db.campaigns.get(id) ?? null;
      },
      async update({ where: { id }, data }: any) {
        const current = db.campaigns.get(id);
        if (!current) throw new Error('Not found');
        const updated = { ...current, ...data };
        db.campaigns.set(id, updated);
        return updated;
      },
    },
    rFP: {
      async findUnique({ where: { id } }: any) {
        return db.rfps.get(id) ?? null;
      },
      async update({ where: { id }, data }: any) {
        const current = db.rfps.get(id);
        if (!current) throw new Error('Not found');
        const updated = { ...current, ...data };
        db.rfps.set(id, updated);
        return updated;
      },
    },
    auditLog: {
      async create({ data }: any) {
        db.auditLogs.push({ id: String(db.auditLogs.length + 1), ...data });
        return db.auditLogs[db.auditLogs.length - 1];
      },
    },
  };
  return {
    default: {
      async $transaction(cb: any) {
        return cb(tx);
      },
    },
  };
});

describe('validateTransition', () => {
  it('allows draft -> approved for planner', () => {
    const res = validateTransition('Campaign', ControlSpaceState.draft, ControlSpaceState.approved, [UserRole.planner]);
    expect(res.ok).toBe(true);
  });

  it('denies approved -> in_market for planner (admin only)', () => {
    const res = validateTransition('Campaign', ControlSpaceState.approved, ControlSpaceState.in_market, [UserRole.planner]);
    expect(res.ok).toBe(false);
  });
});

describe('transitionState', () => {
  beforeEach(() => {
    db.campaigns.clear();
    db.rfps.clear();
    db.auditLogs = [];
    db.campaigns.set('c1', { id: 'c1', status: ControlSpaceState.draft, name: 'Test' });
    db.rfps.set('r1', { id: 'r1', status: ControlSpaceState.draft });
  });

  it('transitions campaign draft -> approved for planner and writes audit log', async () => {
    const updated = await transitionState({
      entity: 'Campaign',
      id: 'c1',
      current: ControlSpaceState.draft,
      target: ControlSpaceState.approved,
      actor: { id: 'u1', roles: [UserRole.planner] },
    });
    expect(updated.status).toBe(ControlSpaceState.approved);
    expect(db.auditLogs.length).toBe(1);
    expect(db.auditLogs[0].action).toBe(`state_transition:${ControlSpaceState.draft}->${ControlSpaceState.approved}`);
  });

  it('rejects when current state mismatches', async () => {
    await expect(
      transitionState({
        entity: 'Campaign',
        id: 'c1',
        current: ControlSpaceState.approved,
        target: ControlSpaceState.in_market,
        actor: { id: 'u1', roles: [UserRole.admin] },
      }),
    ).rejects.toThrow(/Current state mismatch/);
  });

  it('denies transition without required role', async () => {
    await expect(
      transitionState({
        entity: 'Campaign',
        id: 'c1',
        current: ControlSpaceState.draft,
        target: ControlSpaceState.approved,
        actor: { id: 'u2', roles: [UserRole.analyst] },
      }),
    ).rejects.toThrow(/Role not permitted/);
    // No audit log written on failure
    expect(db.auditLogs.length).toBe(0);
  });

  it('transitions RFP draft -> approved for admin', async () => {
    const updated = await transitionState({
      entity: 'RFP',
      id: 'r1',
      current: ControlSpaceState.draft,
      target: ControlSpaceState.approved,
      actor: { id: 'u3', roles: [UserRole.admin] },
    });
    expect(updated.status).toBe(ControlSpaceState.approved);
    expect(db.auditLogs.length).toBe(1);
    expect(db.auditLogs[0].entityType).toBe('RFP');
  });
});

