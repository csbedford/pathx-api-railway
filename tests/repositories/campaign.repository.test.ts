import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import prisma from '../../../src/lib/prisma';
import { CampaignRepository } from '../../../src/repositories/campaign.repository';

const DB_AVAILABLE = !!process.env.DATABASE_URL;

describe.runIf(DB_AVAILABLE)('CampaignRepository', () => {
  let userId: string;

  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean tables in order of FK dependencies
    await prisma.auditLog.deleteMany();
    await prisma.rFP.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.user.deleteMany();

    const user = await prisma.user.create({
      data: { email: `tester_${Date.now()}@example.com`, name: 'Tester', role: 'tester' },
    });
    userId = user.id;
  });

  it('creates and fetches a campaign', async () => {
    const created = await CampaignRepository.create({
      name: 'Test Campaign',
      brandId: 'brand_test',
      objectives: { type: 'conversion' },
      budget: { currency: 'USD', total: 1000 },
      status: 'draft',
      userId,
    });

    expect(created.id).toBeDefined();
    expect(created.name).toBe('Test Campaign');

    const fetched = await CampaignRepository.findById(created.id);
    expect(fetched?.id).toBe(created.id);
    expect((fetched as any).objectives?.type).toBe('conversion');
    expect((fetched as any).budget?.currency).toBe('USD');
  });

  it('lists campaigns in desc order', async () => {
    await CampaignRepository.create({ name: 'A', brandId: 'b', objectives: {}, budget: {}, status: 'draft', userId });
    await CampaignRepository.create({ name: 'B', brandId: 'b', objectives: {}, budget: {}, status: 'draft', userId });
    const list = await CampaignRepository.list();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(new Date(list[0].createdAt).getTime()).toBeGreaterThanOrEqual(new Date(list[1].createdAt).getTime());
  });

  it('updates campaign fields', async () => {
    const c = await CampaignRepository.create({ name: 'C', brandId: 'b', objectives: {}, budget: {}, status: 'draft', userId });
    const updated = await CampaignRepository.update(c.id, { status: 'active', name: 'C2' });
    expect(updated.status).toBe('active');
    expect(updated.name).toBe('C2');
  });

  it('deletes a campaign', async () => {
    const c = await CampaignRepository.create({ name: 'D', brandId: 'b', objectives: {}, budget: {}, status: 'draft', userId });
    await CampaignRepository.delete(c.id);
    const missing = await CampaignRepository.findById(c.id);
    expect(missing).toBeNull();
  });
});

describe.runIf(!DB_AVAILABLE)('CampaignRepository (skipped)', () => {
  it('skips because DATABASE_URL is not set', () => {
    expect(true).toBe(true);
  });
});

