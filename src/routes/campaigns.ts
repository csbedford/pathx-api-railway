import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { zodValidator } from '../utils/validation';
import { CampaignRepository } from '../repositories/campaign.repository';
import { authenticate, requireRole } from '../middleware/auth';
import prisma from '../lib/prisma';
import { ControlSpaceState } from '../types/stateMachine';
import { transitionState, validateTransition } from '../services/stateTransition';
import { campaignService, type IDistributionRequest } from '../services/campaigns';
import { randomUUID } from 'crypto';


const CreateCampaignSchema = z.object({
  name: z.string().min(1),
  brandId: z.string().min(1),
  objectives: z.any(),
  budget: z.any(),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'archived']).default('draft'),
  userId: z.string().uuid(),
  distributionStrategyId: z.string().optional(),
});

const DistributionRequestSchema = z.object({
  scenario: z.enum(['conservative', 'moderate', 'aggressive']).default('moderate'),
  projectionPeriods: z.number().min(1).max(24).default(12),
  seasonalPattern: z.enum(['retail', 'b2b', 'healthcare', 'education', 'travel', 'flat']).default('retail'),
  allocationMethod: z.enum(['equal', 'weighted_spend', 'market_share', 'audience_size']).default('weighted_spend'),
  accountConfigs: z.array(z.object({
    account_id: z.string(),
    account_name: z.string(),
    weight: z.number().default(1.0),
    conversion_rate: z.number().min(0).max(1).default(0.05),
    avg_order_value: z.number().positive().optional(),
    payment_terms_days: z.number().min(0).max(365).default(30),
  })).optional(),
});

// Mock storage for development
const mockCampaigns = new Map<string, any>();

export async function registerCampaignRoutes(app: FastifyInstance) {
  // Database endpoints for development (no auth required)
  app.get('/campaigns', async (req, reply) => {
    try {
      const { status, briefId } = req.query as { status?: string; briefId?: string };
      
      // Direct database query for user testing
      
      const campaigns = await prisma.campaign.findMany({
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
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      return reply.code(500).send({ error: 'Failed to fetch campaigns' });
    }
  });

  app.get('/campaigns/:id', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      
      // Direct database query for user testing
      
      const campaign = await prisma.campaign.findUnique({
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
    } catch (error) {
      console.error('Error fetching campaign:', error);
      return reply.code(500).send({ error: 'Failed to fetch campaign' });
    }
  });

  app.post('/campaigns', async (req, reply) => {
    const { name, briefId, rfpIds, startDate, endDate, budget, partners } = req.body as any;
    
    const id = randomUUID();
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
    const { id } = req.params as { id: string };
    const updates = req.body as any;
    
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
    const { id } = req.params as { id: string };
    const { status } = req.body as any;
    
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
    const { id } = req.params as { id: string };
    
    if (!mockCampaigns.has(id)) {
      return reply.code(404).send({ error: 'Campaign not found' });
    }
    
    mockCampaigns.delete(id);
    return reply.code(204).send();
  });

  // Distribution module endpoints (feature flagged)
  app.post('/campaigns/:id/distribution', { preHandler: [zodValidator(DistributionRequestSchema)] }, async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const distributionRequest = req.body as IDistributionRequest;

      // Check if distribution module is enabled
      if (!campaignService.isDistributionModuleEnabled()) {
        return reply.code(503).send({ 
          error: 'Distribution module not available', 
          message: 'The distribution module is currently disabled. Set ENABLE_DISTRIBUTION_MODULE=true to enable it.' 
        });
      }


      // Create distribution projection
      const projection = await campaignService.createDistributionProjection(id, distributionRequest);
      
      return reply.code(201).send(projection);
    } catch (error: any) {
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
      const { id } = req.params as { id: string };

      // Check if distribution module is enabled
      if (!campaignService.isDistributionModuleEnabled()) {
        return reply.code(503).send({ 
          error: 'Distribution module not available', 
          message: 'The distribution module is currently disabled.' 
        });
      }


      const projection = await campaignService.getDistributionProjection(id);
      
      if (!projection) {
        return reply.code(404).send({ error: 'No distribution projection found for this campaign' });
      }
      
      return reply.send(projection);
    } catch (error: any) {
      console.error('Error fetching distribution projection:', error);
      return reply.code(500).send({ error: 'Failed to fetch distribution projection' });
    }
  });

  app.get('/campaigns/:id/intelligence', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };

      // Check if distribution module is enabled
      if (!campaignService.isDistributionModuleEnabled()) {
        return reply.code(404).send({ intelligence_records: [], total_count: 0 });
      }

      const campaign = await campaignService.findById(id, true);
      
      if (!campaign) {
        return reply.code(404).send({ error: 'Campaign not found' });
      }
      
      return reply.send({
        intelligence_records: campaign.distributionIntelligence || [],
        total_count: campaign.distributionIntelligence?.length || 0,
        brand_id: campaign.brandId
      });
    } catch (error: any) {
      console.error('Error fetching distribution intelligence:', error);
      return reply.code(500).send({ error: 'Failed to fetch distribution intelligence' });
    }
  });

  // Distribution feature flag status endpoint
  app.get('/campaigns/distribution/status', async (req, reply) => {
    return reply.send({
      enabled: campaignService.isDistributionModuleEnabled(),
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
