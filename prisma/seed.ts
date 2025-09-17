import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a user
  const user = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Example',
      role: 'admin',
      organizationId: 'org_001',
    },
  });

  // Create campaigns with specific IDs that match frontend expectations
  const spring = await prisma.campaign.create({
    data: {
      id: '2',
      name: 'Spring Launch 2025',
      brandId: 'brand_acme',
      status: 'active',
      userId: user.id,
      objectives: {
        type: 'conversion',
        kpis: [{ code: 'CPA', name: 'Cost per Acquisition', unit: 'cpa', direction: 'lower_is_better', target: 30 }],
      },
      budget: {
        currency: 'USD',
        total: 120000,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        pacing: 'even',
      },
    },
  });

  const summer = await prisma.campaign.create({
    data: {
      id: '1',
      name: 'Holiday Season 2024',
      brandId: 'brand_acme',
      status: 'active',
      userId: user.id,
      objectives: { type: 'brand_awareness' },
      budget: { currency: 'USD', total: 75000 },
    },
  });

  const backToSchool = await prisma.campaign.create({
    data: {
      id: '3',
      name: 'Back to School 2024',
      brandId: 'brand_acme',
      status: 'completed',
      userId: user.id,
      objectives: { type: 'conversion' },
      budget: { currency: 'USD', total: 30000 },
    },
  });

  // Create an RFP for spring campaign
  await prisma.rFP.create({
    data: {
      campaignId: spring.id,
      partners: { invited: ['walmart', 'amazon'] },
      status: 'requested',
      requestedAt: new Date(),
      responses: { walmart: { status: 'received' } },
    },
  });

  // Audit logs
  await prisma.auditLog.createMany({
    data: [
      {
        entityType: 'Campaign',
        entityId: spring.id,
        action: 'create',
        actorId: user.id,
        changes: { name: spring.name, status: spring.status },
      },
      {
        entityType: 'Campaign',
        entityId: summer.id,
        action: 'create',
        actorId: user.id,
        changes: { name: summer.name, status: summer.status },
      },
      {
        entityType: 'Campaign',
        entityId: backToSchool.id,
        action: 'create',
        actorId: user.id,
        changes: { name: backToSchool.name, status: backToSchool.status },
      },
    ],
  });

  // eslint-disable-next-line no-console
  console.log('Seed completed');
}

main()
  .catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

