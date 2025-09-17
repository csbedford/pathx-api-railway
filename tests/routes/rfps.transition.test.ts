import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../../src/app';
import { ControlSpaceState } from '../../src/types/stateMachine';
import jwt from 'jsonwebtoken';

const SECRET = 'test_secret_transition';

// In-memory DB mock for RFPs
const db = {
  rfps: new Map<string, any>(),
  auditLogs: [] as any[],
};

vi.mock('../../src/lib/prisma', () => {
  const tx = {
    rFP: {
      async findUnique({ where: { id } }: any) {
        return db.rfps.get(id) ?? null;
      },
      async update({ where: { id }, data }: any) {
        const current = db.rfps.get(id);
        if (!current) throw Object.assign(new Error('Not found'), { statusCode: 404 });
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
      rFP: tx.rFP,
      auditLog: tx.auditLog,
    },
  };
});

function authHeader(roles: string[] = []) {
  const token = jwt.sign({ sub: 'u1', roles }, SECRET);
  return { Authorization: `Bearer ${token}` };
}

describe('RFP transition route', () => {
  let app: Awaited<ReturnType<typeof createApp>>;
  const base = '/api/v1/rfps';

  beforeAll(async () => {
    process.env.JWT_SECRET = SECRET;
    app = await createApp();
  });

  beforeEach(() => {
    db.rfps.clear();
    db.auditLogs = [];
    db.rfps.set('r1', { id: 'r1', status: ControlSpaceState.draft });
  });

  it('rejects invalid transition with 400', async () => {
    const res = await app.inject({ method: 'PUT', url: `${base}/r1/transition`, headers: authHeader(['admin']), payload: { targetState: 'in_market' } });
    expect(res.statusCode).toBe(400);
  });

  it('allows draft -> approved for planner', async () => {
    const res = await app.inject({ method: 'PUT', url: `${base}/r1/transition`, headers: authHeader(['planner']), payload: { targetState: 'approved' } });
    expect(res.statusCode).toBe(200);
    expect((res.json() as any).status).toBe('approved');
  });

  it('requires admin for approved -> in_market', async () => {
    db.rfps.set('r1', { id: 'r1', status: ControlSpaceState.approved });
    const res = await app.inject({ method: 'PUT', url: `${base}/r1/transition`, headers: authHeader(['planner']), payload: { targetState: 'in_market' } });
    expect(res.statusCode).toBe(403);
  });

  it('admin can go approved -> in_market', async () => {
    db.rfps.set('r1', { id: 'r1', status: ControlSpaceState.approved });
    const res = await app.inject({ method: 'PUT', url: `${base}/r1/transition`, headers: authHeader(['admin']), payload: { targetState: 'in_market' } });
    expect(res.statusCode).toBe(200);
    expect((res.json() as any).status).toBe('in_market');
  });
});

