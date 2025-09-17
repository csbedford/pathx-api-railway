import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { createApp } from '../app';

// In-memory DB mock for campaigns and rfps
const store = {
  campaigns: new Map<string, any>(),
  rfps: new Map<string, any>(),
  auditLogs: [] as any[],
};

vi.mock('../lib/prisma', () => {
  const tx = {
    campaign: {
      async findUnique({ where: { id } }: any) {
        return store.campaigns.get(id) ?? null;
      },
      async update({ where: { id }, data }: any) {
        const current = store.campaigns.get(id);
        if (!current) throw Object.assign(new Error('Not found'), { statusCode: 404 });
        const updated = { ...current, ...data };
        store.campaigns.set(id, updated);
        return updated;
      },
      async create({ data }: any) {
        const rec = { ...data };
        store.campaigns.set(rec.id, rec);
        return rec;
      },
    },
    rFP: {
      async findUnique({ where: { id } }: any) {
        return store.rfps.get(id) ?? null;
      },
      async update({ where: { id }, data }: any) {
        const current = store.rfps.get(id);
        if (!current) throw Object.assign(new Error('Not found'), { statusCode: 404 });
        const updated = { ...current, ...data };
        store.rfps.set(id, updated);
        return updated;
      },
    },
    auditLog: {
      async create({ data }: any) {
        store.auditLogs.push({ id: String(store.auditLogs.length + 1), timestamp: new Date(), ...data });
        return store.auditLogs[store.auditLogs.length - 1];
      },
    },
  };
  return {
    default: {
      async $transaction(cb: any) {
        return cb(tx);
      },
      campaign: tx.campaign,
      rFP: tx.rFP,
      auditLog: tx.auditLog,
    },
  };
});

describe('Auth E2E: login, protected access, refresh, RBAC, transitions', () => {
  const base = '/api/v1';
  let app: Awaited<ReturnType<typeof createApp>>;

  beforeAll(async () => {
    process.env.JWT_SECRET = 'e2e_secret';
    process.env.REFRESH_TOKEN_SECRET = 'e2e_refresh_secret';
    app = await createApp();
  });

  beforeEach(() => {
    store.campaigns.clear();
    store.rfps.clear();
    store.auditLogs = [];
    // seed a campaign
    store.campaigns.set('c1', {
      id: 'c1',
      name: 'C1',
      brandId: 'b1',
      objectives: {},
      budget: {},
      status: 'draft',
      userId: 'u-seed',
    });
  });

  it('login -> token -> protected endpoint -> expiry -> refresh -> access again', async () => {
    process.env.JWT_EXPIRES_IN = '1s';
    // Login
    const login = await app.inject({ method: 'POST', url: `${base}/auth/login`, payload: { email: 'analyst@example.com', password: 'password123' } });
    expect(login.statusCode).toBe(200);
    const { accessToken, refreshToken } = login.json() as any;

    // Access protected GET (analyst required in our route guards)
    const r1 = await app.inject({ method: 'GET', url: `${base}/campaigns/c1/status`, headers: { Authorization: `Bearer ${accessToken}` } });
    expect(r1.statusCode).toBe(200);

    // Wait for expiry
    await new Promise((res) => setTimeout(res, 1200));
    const r2 = await app.inject({ method: 'GET', url: `${base}/campaigns/c1/status`, headers: { Authorization: `Bearer ${accessToken}` } });
    expect(r2.statusCode).toBe(401);

    // Refresh
    const refresh = await app.inject({ method: 'POST', url: `${base}/auth/refresh`, payload: { refreshToken } });
    expect(refresh.statusCode).toBe(200);
    const { accessToken: newAccess } = refresh.json() as any;

    const r3 = await app.inject({ method: 'GET', url: `${base}/campaigns/c1/status`, headers: { Authorization: `Bearer ${newAccess}` } });
    expect(r3.statusCode).toBe(200);
  });

  it('RBAC: planner can POST campaign; analyst cannot; analyst can GET; planner cannot GET (strict role gate in this app)', async () => {
    // planner login
    const plannerLogin = await app.inject({ method: 'POST', url: `${base}/auth/login`, payload: { email: 'planner@example.com', password: 'password123' } });
    const plannerToken = (plannerLogin.json() as any).accessToken as string;
    // analyst login
    const analystLogin = await app.inject({ method: 'POST', url: `${base}/auth/login`, payload: { email: 'analyst@example.com', password: 'password123' } });
    const analystToken = (analystLogin.json() as any).accessToken as string;

    // planner can POST
    const create = await app.inject({
      method: 'POST',
      url: `${base}/campaigns`,
      headers: { Authorization: `Bearer ${plannerToken}` },
      payload: { name: 'N', brandId: 'b', objectives: {}, budget: {}, userId: 'u1' },
    });
    expect(create.statusCode).toBe(201);

    // analyst cannot POST
    const create2 = await app.inject({
      method: 'POST',
      url: `${base}/campaigns`,
      headers: { Authorization: `Bearer ${analystToken}` },
      payload: { name: 'N', brandId: 'b', objectives: {}, budget: {}, userId: 'u1' },
    });
    expect(create2.statusCode).toBe(403);

    // analyst can GET
    const g1 = await app.inject({ method: 'GET', url: `${base}/campaigns/c1`, headers: { Authorization: `Bearer ${analystToken}` } });
    expect(g1.statusCode).toBe(200);

    // planner cannot GET (strict analyst-only in current guards)
    const g2 = await app.inject({ method: 'GET', url: `${base}/campaigns/c1`, headers: { Authorization: `Bearer ${plannerToken}` } });
    expect(g2.statusCode).toBe(403);
  });

  it('State transitions enforce roles', async () => {
    // planner moves draft -> approved
    const plannerLogin = await app.inject({ method: 'POST', url: `${base}/auth/login`, payload: { email: 'planner@example.com', password: 'password123' } });
    const plannerToken = (plannerLogin.json() as any).accessToken as string;
    const t1 = await app.inject({ method: 'PUT', url: `${base}/campaigns/c1/transition`, headers: { Authorization: `Bearer ${plannerToken}` }, payload: { targetState: 'approved' } });
    expect(t1.statusCode).toBe(200);
    expect((t1.json() as any).status).toBe('approved');

    // planner cannot approved -> in_market (admin only)
    const t2 = await app.inject({ method: 'PUT', url: `${base}/campaigns/c1/transition`, headers: { Authorization: `Bearer ${plannerToken}` }, payload: { targetState: 'in_market' } });
    expect(t2.statusCode).toBe(403);

    // admin can approved -> in_market
    const adminLogin = await app.inject({ method: 'POST', url: `${base}/auth/login`, payload: { email: 'admin@example.com', password: 'password123' } });
    const adminToken = (adminLogin.json() as any).accessToken as string;
    const t3 = await app.inject({ method: 'PUT', url: `${base}/campaigns/c1/transition`, headers: { Authorization: `Bearer ${adminToken}` }, payload: { targetState: 'in_market' } });
    expect(t3.statusCode).toBe(200);
    expect((t3.json() as any).status).toBe('in_market');
  });
});

