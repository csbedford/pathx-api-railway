"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerCampaignRoutes = registerCampaignRoutes;
const zod_1 = require("zod");
const validation_1 = require("../utils/validation");
const prisma_1 = __importDefault(require("../lib/prisma"));
const campaigns_1 = require("../services/campaigns");
const crypto_1 = require("crypto");
const CreateCampaignSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    brandId: zod_1.z.string().min(1),
    objectives: zod_1.z.any(),
    budget: zod_1.z.any(),
    status: zod_1.z.enum(['draft', 'active', 'paused', 'completed', 'archived']).default('draft'),
    userId: zod_1.z.string().uuid(),
    distributionStrategyId: zod_1.z.string().optional(),
});
const DistributionRequestSchema = zod_1.z.object({
    scenario: zod_1.z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
    projectionPeriods: zod_1.z.number().min(1).max(24).default(12),
    seasonalPattern: zod_1.z.enum(['retail', 'b2b', 'healthcare', 'education', 'travel', 'flat']).default('retail'),
    allocationMethod: zod_1.z.enum(['equal', 'weighted_spend', 'market_share', 'audience_size']).default('weighted_spend'),
    accountConfigs: zod_1.z.array(zod_1.z.object({
        account_id: zod_1.z.string(),
        account_name: zod_1.z.string(),
        weight: zod_1.z.number().default(1.0),
        conversion_rate: zod_1.z.number().min(0).max(1).default(0.05),
        avg_order_value: zod_1.z.number().positive().optional(),
        payment_terms_days: zod_1.z.number().min(0).max(365).default(30),
    })).optional(),
});
// Mock storage for development
const mockCampaigns = new Map();
async function registerCampaignRoutes(app) {
    // Database endpoints for development (no auth required)
    app.get('/campaigns', async (req, reply) => {
        try {
            const { status, briefId } = req.query;
            // Direct database query for user testing
            const campaigns = await prisma_1.default.campaign.findMany({
                where: {
                    ...(status && { status }),
                    // Note: briefId filter removed as it's not in current schema
                },
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    },
                    rfps: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            return reply.send(campaigns);
        }
        catch (error) {
            console.error('Error fetching campaigns:', error);
            return reply.code(500).send({ error: 'Failed to fetch campaigns' });
        }
    });
    app.get('/campaigns/:id', async (req, reply) => {
        try {
            const { id } = req.params;
            // Direct database query for user testing
            const campaign = await prisma_1.default.campaign.findUnique({
                where: { id },
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    },
                    rfps: true
                }
            });
            if (!campaign) {
                return reply.code(404).send({ error: 'Campaign not found' });
            }
            return reply.send(campaign);
        }
        catch (error) {
            console.error('Error fetching campaign:', error);
            return reply.code(500).send({ error: 'Failed to fetch campaign' });
        }
    });
    app.post('/campaigns', async (req, reply) => {
        const { name, briefId, rfpIds, startDate, endDate, budget, partners } = req.body;
        const id = (0, crypto_1.randomUUID)();
        const now = new Date().toISOString();
        const campaign = {
            id,
            name,
            briefId,
            rfpIds: rfpIds || [],
            status: 'draft',
            startDate,
            endDate,
            budget: {
                total: budget.total,
                spent: 0,
                currency: budget.currency || 'USD',
            },
            partners: partners || [],
            createdAt: now,
            updatedAt: now,
        };
        mockCampaigns.set(id, campaign);
        return reply.code(201).send(campaign);
    });
    app.put('/campaigns/:id', async (req, reply) => {
        const { id } = req.params;
        const updates = req.body;
        const campaign = mockCampaigns.get(id);
        if (!campaign) {
            return reply.code(404).send({ error: 'Campaign not found' });
        }
        const updatedCampaign = {
            ...campaign,
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        mockCampaigns.set(id, updatedCampaign);
        return reply.send(updatedCampaign);
    });
    app.patch('/campaigns/:id', async (req, reply) => {
        const { id } = req.params;
        const { status } = req.body;
        const campaign = mockCampaigns.get(id);
        if (!campaign) {
            return reply.code(404).send({ error: 'Campaign not found' });
        }
        const updatedCampaign = {
            ...campaign,
            status,
            updatedAt: new Date().toISOString(),
        };
        mockCampaigns.set(id, updatedCampaign);
        return reply.send(updatedCampaign);
    });
    app.delete('/campaigns/:id', async (req, reply) => {
        const { id } = req.params;
        if (!mockCampaigns.has(id)) {
            return reply.code(404).send({ error: 'Campaign not found' });
        }
        mockCampaigns.delete(id);
        return reply.code(204).send();
    });
    // Distribution module endpoints (feature flagged)
    app.post('/campaigns/:id/distribution', { preHandler: [(0, validation_1.zodValidator)(DistributionRequestSchema)] }, async (req, reply) => {
        try {
            const { id } = req.params;
            const distributionRequest = req.body;
            // Check if distribution module is enabled
            if (!campaigns_1.campaignService.isDistributionModuleEnabled()) {
                return reply.code(503).send({
                    error: 'Distribution module not available',
                    message: 'The distribution module is currently disabled. Set ENABLE_DISTRIBUTION_MODULE=true to enable it.'
                });
            }
            // Create distribution projection
            const projection = await campaigns_1.campaignService.createDistributionProjection(id, distributionRequest);
            return reply.code(201).send(projection);
        }
        catch (error) {
            console.error('Error creating distribution projection:', error);
            if (error.message === 'Campaign not found') {
                return reply.code(404).send({ error: 'Campaign not found' });
            }
            if (error.message === 'Distribution module is not enabled') {
                return reply.code(503).send({
                    error: 'Distribution module not available',
                    message: 'The distribution module is currently disabled.'
                });
            }
            if (error.message === 'Distribution service unavailable') {
                return reply.code(503).send({
                    error: 'Distribution service unavailable',
                    message: 'The distribution service is currently unavailable. Please try again later.'
                });
            }
            return reply.code(500).send({ error: 'Failed to create distribution projection' });
        }
    });
    app.get('/campaigns/:id/distribution', async (req, reply) => {
        try {
            const { id } = req.params;
            // Check if distribution module is enabled
            if (!campaigns_1.campaignService.isDistributionModuleEnabled()) {
                return reply.code(503).send({
                    error: 'Distribution module not available',
                    message: 'The distribution module is currently disabled.'
                });
            }
            const projection = await campaigns_1.campaignService.getDistributionProjection(id);
            if (!projection) {
                return reply.code(404).send({ error: 'No distribution projection found for this campaign' });
            }
            return reply.send(projection);
        }
        catch (error) {
            console.error('Error fetching distribution projection:', error);
            return reply.code(500).send({ error: 'Failed to fetch distribution projection' });
        }
    });
    app.get('/campaigns/:id/intelligence', async (req, reply) => {
        try {
            const { id } = req.params;
            // Check if distribution module is enabled
            if (!campaigns_1.campaignService.isDistributionModuleEnabled()) {
                return reply.code(404).send({ intelligence_records: [], total_count: 0 });
            }
            const campaign = await campaigns_1.campaignService.findById(id, true);
            if (!campaign) {
                return reply.code(404).send({ error: 'Campaign not found' });
            }
            return reply.send({
                intelligence_records: campaign.distributionIntelligence || [],
                total_count: campaign.distributionIntelligence?.length || 0,
                brand_id: campaign.brandId
            });
        }
        catch (error) {
            console.error('Error fetching distribution intelligence:', error);
            return reply.code(500).send({ error: 'Failed to fetch distribution intelligence' });
        }
    });
    // Distribution feature flag status endpoint
    app.get('/campaigns/distribution/status', async (req, reply) => {
        return reply.send({
            enabled: campaigns_1.campaignService.isDistributionModuleEnabled(),
            service_url: process.env.DISTRIBUTION_SERVICE_URL || 'http://localhost:8002'
        });
    });
    // Original authenticated endpoints (kept for reference)
    /*
    // List campaigns
    app.get('/campaigns', { preHandler: [authenticate, requireRole('analyst')] }, async (_req, _reply) => {
      const items = await CampaignRepository.list();
      return items;
    });
    // Submit a campaign proposal
    app.post(
      '/campaigns',
      { preHandler: [authenticate, requireRole('planner'), zodValidator(CreateCampaignSchema)] },
      async (req, reply) => {
        const created = await CampaignRepository.create(req.body as any);
        return reply.code(201).send(created);
      },
    );
  
    // Get a campaign by id
    app.get('/campaigns/:id', { preHandler: [authenticate, requireRole('analyst')] }, async (req, reply) => {
      const { id } = req.params as { id: string };
      const found = await CampaignRepository.findById(id);
      if (!found) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Campaign not found' });
      return found;
    });
  
    // Get campaign status
    app.get('/campaigns/:id/status', { preHandler: [authenticate, requireRole('analyst')] }, async (req, reply) => {
      const { id } = req.params as { id: string };
      const found = await CampaignRepository.findById(id);
      if (!found) return reply.code(404).send({ statusCode: 404, error: 'Not Found', message: 'Campaign not found' });
      return { id: found.id, status: found.status };
    });
  
    // State transition endpoint
    app.put('/campaigns/:id/transition', { preHandler: [authenticate] }, async (req, reply) => {
      const { id } = req.params as { id: string };
      const targetState = (req.body as any)?.targetState as string | undefined;
      if (!targetState) return reply.code(400).send({ error: 'bad_request', message: 'Missing targetState' });
  
      const found = await prisma.campaign.findUnique({ where: { id } });
      if (!found) return reply.code(404).send({ error: 'not_found', message: 'Campaign not found' });
  
      const current = String(found.status) as ControlSpaceState | string;
      const check = validateTransition('Campaign', current, targetState, ((req as any).user?.roles ?? []) as string[]);
      if (!check.ok) {
        const isInvalid = (check.reason || '').includes('No transition defined');
        return reply.code(isInvalid ? 400 : 403).send({ error: isInvalid ? 'bad_request' : 'forbidden', message: check.reason });
      }
  
      try {
        const updated = await transitionState({
          entity: 'Campaign',
          id,
          current,
          target: targetState as ControlSpaceState,
          actor: { id: (req as any).user?.sub, roles: ((req as any).user?.roles ?? []) as string[] },
        });
        return reply.send(updated);
      } catch (e: any) {
        const status = e?.statusCode ?? 500;
        return reply.code(status).send({ error: status >= 500 ? 'server_error' : 'conflict', message: e?.message || 'transition error' });
      }
    });
    */
}
//# sourceMappingURL=campaigns.js.map