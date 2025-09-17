import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app';
import prisma from '../../src/lib/prisma';

const DB = !!process.env.DATABASE_URL;

describe.runIf(DB)('Audit middleware', () => {
  let token: string;
  let userId: string;

  beforeAll(async () => {
    await prisma.$connect();
    token = jwt.sign({ sub: '00000000-0000-0000-0000-000000000001' }, 'development_secret_change_in_production');
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    await prisma.auditLog.deleteMany();
    await prisma.rFP.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.user.deleteMany();
    const u = await prisma.user.create({ data: { email: `a_${Date.now()}@ex.com`, name: 'A', role: 'tester' } });
    userId = u.id;
  });

  it('creates audit log for POST mutation and redacts sensitive data', async () => {
    const app = await createApp();

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        name: 'Audited',
        brandId: 'brand_x',
        userId,
        status: 'draft',
        objectives: { type: 'conversion', token: 'super-secret-token', nested: { password: 'p@ss' } },
        budget: { currency: 'USD', total: 10, apiKey: 'K123' },
      },
    });
    expect(res.statusCode).toBe(201);
    const created = res.json();

    const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' } });
    expect(logs.length).toBeGreaterThan(0);
    const latest = logs[0];
    expect(latest.action).toBe('create');
    expect(latest.entityType).toBe('Campaign');
    // Ensure redaction occurred
    const changes: any = latest.changes;
    const after = changes?.after ?? changes?.changed?.objectives?.after; // supports both create/update structures
    const obj = after?.objectives ?? after; // normalize
    const bud = after?.budget ?? after; // normalize
    expect(JSON.stringify(changes)).not.toContain('super-secret-token');
    expect(JSON.stringify(changes)).not.toContain('p@ss');
    expect(obj?.token ?? 'REDACT').toBe('[REDACTED]');
    expect(obj?.nested?.password ?? 'REDACT').toBe('[REDACTED]');
    if (bud?.apiKey) expect(bud.apiKey).toBe('[REDACTED]');

    // Read should not create a new log
    const beforeCount = await prisma.auditLog.count();
    const resGet = await app.inject({ method: 'GET', url: `/api/v1/campaigns/${created.id}`, headers: { authorization: `Bearer ${token}` } });
    expect(resGet.statusCode).toBe(200);
    const afterCount = await prisma.auditLog.count();
    expect(afterCount).toBe(beforeCount);
  });

  it('logs failed requests with error', async () => {
    const app = await createApp();
    const countBefore = await prisma.auditLog.count();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/campaigns',
      headers: { authorization: `Bearer ${token}` },
      payload: { name: 'x' }, // invalid
    });
    expect(res.statusCode).toBeGreaterThanOrEqual(400);
    const countAfter = await prisma.auditLog.count();
    expect(countAfter).toBe(countBefore + 1);
    const last = await prisma.auditLog.findFirst({ orderBy: { timestamp: 'desc' } });
    expect(last?.action).toBe('error');
    expect((last?.changes as any)?.status).toBe(res.statusCode);
  });
});

describe.runIf(!DB)('Audit middleware (skipped)', () => {
  it('skips because DATABASE_URL is not set', () => {
    expect(true).toBe(true);
  });
});

