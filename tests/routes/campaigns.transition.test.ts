import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app';
import { ControlSpaceState } from '../../src/types/stateMachine';
import jwt from 'jsonwebtoken';

const SECRET = 'test_secret_transition';

// In-memory DB mock
const db = {
  campaigns: new Map<string, any>(),
  auditLogs: [] as any[],
};

vi.mock('../../src/lib/prisma', () => {
  const tx = {
    campaign: {
      async findUnique({ where: { id } }: any) {
        return db.campaigns.get(id) ?? null;
      },
      async update({ where: { id }, data }: any) {
        const current = db.campaigns.get(id);
        if (!current) throw Object.assign(new Error('Not found'), { statusCode: 404 });
        const updated = { ...current, ...data };
        db.campaigns.set(id, updated);
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
      campaign: tx.campaign,
      auditLog: tx.auditLog,
    },
  };
});

function authHeader(roles: string[] = []) {
  const token = jwt.sign({ sub: 'u1', roles }, SECRET);
  return { Authorization: `Bearer ${token}` };
}

describe('Campaign transition route', () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  const base = '/api/v1/campaigns';

  beforeAll(async () => {
    process.env.JWT_SECRET = SECRET;
    app = await createApp();
  });

  beforeEach(() => {
    db.campaigns.clear();
    db.auditLogs = [];
    db.campaigns.set('c1', { id: 'c1', status: ControlSpaceState.draft, name: 'C1' });
  });

  it('returns 400 for invalid transition (draft -> in_market)', async () => {
    const res = await app.inject({ method: 'PUT', url: `${base}/c1/transition`, headers: authHeader(['admin']), payload: { targetState: 'in_market' } });
    expect(res.statusCode).toBe(400);
  });

  it('returns 403 for insufficient role (approved -> in_market requires admin)', async () => {
    // move to approved first (planner allowed)
    db.campaigns.set('c1', { id: 'c1', status: ControlSpaceState.approved, name: 'C1' });
    const res = await app.inject({ method: 'PUT', url: `${base}/c1/transition`, headers: authHeader(['planner']), payload: { targetState: 'in_market' } });
    expect(res.statusCode).toBe(403);
  });

  it('allows draft -> approved for planner', async () => {
    const res = await app.inject({ method: 'PUT', url: `${base}/c1/transition`, headers: authHeader(['planner']), payload: { targetState: 'approved' } });
    expect(res.statusCode).toBe(200);
    const body = res.json() as any;
    expect(body.status).toBe('approved');
    expect(db.auditLogs.length).toBe(1);
  });

  it('allows approved -> in_market for admin', async () => {
    db.campaigns.set('c1', { id: 'c1', status: ControlSpaceState.approved, name: 'C1' });
    const res = await app.inject({ method: 'PUT', url: `${base}/c1/transition`, headers: authHeader(['admin']), payload: { targetState: 'in_market' } });
    expect(res.statusCode).toBe(200);
    expect((res.json() as any).status).toBe('in_market');
  });

  it('allows in_market -> archived for admin', async () => {
    db.campaigns.set('c1', { id: 'c1', status: ControlSpaceState.in_market, name: 'C1' });
    const res = await app.inject({ method: 'PUT', url: `${base}/c1/transition`, headers: authHeader(['admin']), payload: { targetState: 'archived' } });
    expect(res.statusCode).toBe(200);
    expect((res.json() as any).status).toBe('archived');
  });

  it('allows draft -> archived for admin', async () => {
    const res = await app.inject({ method: 'PUT', url: `${base}/c1/transition`, headers: authHeader(['admin']), payload: { targetState: 'archived' } });
    expect(res.statusCode).toBe(200);
    expect((res.json() as any).status).toBe('archived');
  });
});

