import type { FastifyInstance } from 'fastify';
import { 
  CreatePartnerSchema, 
  UpdatePartnerSchema, 
  PartnerSearchSchema,
  BulkPartnerOperationSchema,
  PartnerHealthMetricSchema,
  PartnerCapabilitySchema,
  CreativeSpecSchema,
  CampaignPartnerAssociationSchema,
  CapabilityComparisonSchema
} from '../types/partner.js';
import { PartnerService } from '../services/partnerService.js';
import prisma from '../lib/prisma.js';

export async function registerPartnerRoutes(app: FastifyInstance) {
  const partnerService = new PartnerService(prisma);

  // Remove schema registration - use inline validation instead

  // Create a new partner
  app.post('/partners', {
    schema: {
      tags: ['Partners'],
      summary: 'Create a new partner',
      response: {
        201: {
          description: 'Partner created successfully',
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            status: { type: 'string' },
            createdAt: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const data = CreatePartnerSchema.parse(request.body);
      const userId = (request as any).user?.id || 'system';
      
      const partner = await partnerService.createPartner(data, userId);
      
      reply.code(201).send({
        id: partner.id,
        name: partner.name,
        displayName: partner.displayName,
        type: partner.type,
        status: partner.status,
        onboardingStatus: partner.onboardingStatus,
        createdAt: partner.createdAt
      });
    } catch (error) {
      app.log.error('Failed to create partner:', error);
      reply.code(400).send({ error: 'Failed to create partner' });
    }
  });

  // Get partners with search and filtering
  app.get('/partners', {
    schema: {
      tags: ['Partners'],
      summary: 'Search and list partners',
      querystring: {
        type: 'object',
        properties: {
          query: { type: 'string' },
          type: { type: 'string' },
          status: { type: 'string' },
          capabilities: { type: 'array', items: { type: 'string' } },
          minBudget: { type: 'number' },
          maxBudget: { type: 'number' },
          page: { type: 'number', minimum: 1, default: 1 },
          limit: { type: 'number', minimum: 1, maximum: 100, default: 20 },
          sortBy: { type: 'string', enum: ['name', 'type', 'status', 'createdAt', 'updatedAt'], default: 'name' },
          sortOrder: { type: 'string', enum: ['asc', 'desc'], default: 'asc' }
        }
      },
      response: {
        200: {
          description: 'Partners retrieved successfully',
          type: 'object',
          properties: {
            partners: { type: 'array' },
            pagination: { type: 'object' }
          }
        }
      }
    }
  }, async (request) => {
    try {
      const searchParams = PartnerSearchSchema.parse(request.query);
      return await partnerService.searchPartners(searchParams);
    } catch (error) {
      app.log.error('Failed to search partners:', error);
      throw new Error('Failed to search partners');
    }
  });

  // Get a specific partner
  app.get('/partners/:id', {
    schema: {
      tags: ['Partners'],
      summary: 'Get partner by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          description: 'Partner retrieved successfully',
          type: 'object'
        },
        404: {
          description: 'Partner not found',
          type: 'object',
          properties: {
            error: { type: 'string' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const partner = await partnerService.getPartner(id);
      
      if (!partner) {
        reply.code(404).send({ error: 'Partner not found' });
        return;
      }
      
      return partner;
    } catch (error) {
      app.log.error('Failed to get partner:', error);
      reply.code(500).send({ error: 'Failed to get partner' });
    }
  });

  // Update a partner
  app.put('/partners/:id', {
    schema: {
      tags: ['Partners'],
      summary: 'Update partner',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      response: {
        200: {
          description: 'Partner updated successfully',
          type: 'object'
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = UpdatePartnerSchema.parse(request.body);
      const userId = (request as any).user?.id || 'system';
      
      const partner = await partnerService.updatePartner(id, data, userId);
      return partner;
    } catch (error) {
      app.log.error('Failed to update partner:', error);
      reply.code(400).send({ error: 'Failed to update partner' });
    }
  });

  // Bulk operations on partners
  app.post('/partners/bulk', {
    schema: {
      tags: ['Partners'],
      summary: 'Perform bulk operations on partners',
      body: {
        type: 'object',
        properties: {
          partnerIds: { type: 'array', items: { type: 'string' } },
          operation: { type: 'string', enum: ['ACTIVATE', 'DEACTIVATE', 'SUSPEND', 'ARCHIVE', 'DELETE'] },
          reason: { type: 'string' }
        },
        required: ['partnerIds', 'operation']
      },
      response: {
        200: {
          description: 'Bulk operation completed',
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            affectedCount: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const data = BulkPartnerOperationSchema.parse(request.body);
      const userId = (request as any).user?.id || 'system';
      
      const result = await partnerService.bulkOperation(data, userId);
      return result;
    } catch (error) {
      app.log.error('Failed to perform bulk operation:', error);
      reply.code(400).send({ error: 'Failed to perform bulk operation' });
    }
  });

  // Update partner status
  app.patch('/partners/:id/status', {
    schema: {
      tags: ['Partners'],
      summary: 'Update partner status',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED'] }
        },
        required: ['status']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status } = request.body as { status: any };
      const userId = (request as any).user?.id || 'system';
      
      const partner = await partnerService.updatePartnerStatus(id, status, userId);
      return partner;
    } catch (error) {
      app.log.error('Failed to update partner status:', error);
      reply.code(400).send({ error: 'Failed to update partner status' });
    }
  });

  // Partner health monitoring
  app.get('/partners/:id/health', {
    schema: {
      tags: ['Partners'],
      summary: 'Get partner health metrics',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      querystring: {
        type: 'object',
        properties: {
          days: { type: 'number', minimum: 1, maximum: 30, default: 7 }
        }
      }
    }
  }, async (request) => {
    try {
      const { id } = request.params as { id: string };
      const { days = 7 } = request.query as { days?: number };
      
      return await partnerService.getPartnerHealth(id, days);
    } catch (error) {
      app.log.error('Failed to get partner health:', error);
      throw new Error('Failed to get partner health');
    }
  });

  app.post('/partners/:id/health', {
    schema: {
      tags: ['Partners'],
      summary: 'Record partner health metric',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          timestamp: { type: 'string' },
          apiStatus: { type: 'string', enum: ['HEALTHY', 'DEGRADED', 'DOWN', 'UNKNOWN'] },
          responseTime: { type: 'number' },
          errorRate: { type: 'number' },
          uptime: { type: 'number' },
          lastError: { type: 'string' },
          healthScore: { type: 'number', minimum: 0, maximum: 100 },
          details: { type: 'object' }
        },
        required: ['timestamp', 'apiStatus']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = PartnerHealthMetricSchema.parse(request.body);
      
      const metric = await partnerService.recordHealthMetric(id, data);
      reply.code(201).send(metric);
    } catch (error) {
      app.log.error('Failed to record health metric:', error);
      reply.code(400).send({ error: 'Failed to record health metric' });
    }
  });

  // Partner capabilities
  app.post('/partners/:id/capabilities', {
    schema: {
      tags: ['Partners'],
      summary: 'Add partner capability',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          category: { type: 'string' },
          details: { type: 'object' },
          sourceType: { type: 'string', enum: ['MANUAL', 'API_DISCOVERY', 'DOCUMENTATION', 'RATE_CARD', 'FORM_SUBMISSION'] },
          sourceData: { type: 'object' }
        },
        required: ['name', 'category', 'details', 'sourceType']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = PartnerCapabilitySchema.parse(request.body);
      const userId = (request as any).user?.id || 'system';
      
      const capability = await partnerService.addCapability(id, data, userId);
      reply.code(201).send(capability);
    } catch (error) {
      app.log.error('Failed to add capability:', error);
      reply.code(400).send({ error: 'Failed to add capability' });
    }
  });

  // Creative specifications
  app.post('/partners/:id/creative-specs', {
    schema: {
      tags: ['Partners'],
      summary: 'Add creative specification',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          format: { type: 'string' },
          dimensions: { type: 'object' },
          fileType: { type: 'string' },
          maxFileSize: { type: 'number' },
          requirements: { type: 'object' },
          examples: { type: 'object' }
        },
        required: ['format', 'dimensions', 'fileType', 'maxFileSize', 'requirements']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const data = CreativeSpecSchema.parse(request.body);
      const userId = (request as any).user?.id || 'system';
      
      const spec = await partnerService.addCreativeSpec(id, data, userId);
      reply.code(201).send(spec);
    } catch (error) {
      app.log.error('Failed to add creative spec:', error);
      reply.code(400).send({ error: 'Failed to add creative spec' });
    }
  });

  // Campaign associations
  app.post('/partners/campaign-associations', {
    schema: {
      tags: ['Partners'],
      summary: 'Associate partner with campaign',
      body: {
        type: 'object',
        properties: {
          campaignId: { type: 'string' },
          partnerId: { type: 'string' },
          status: { type: 'string', enum: ['ASSOCIATED', 'CONFIGURED', 'LAUNCHED', 'PAUSED', 'COMPLETED', 'FAILED'] },
          budget: { type: 'object' },
          targeting: { type: 'object' },
          creative: { type: 'object' }
        },
        required: ['campaignId', 'partnerId']
      }
    }
  }, async (request, reply) => {
    try {
      const data = CampaignPartnerAssociationSchema.parse(request.body);
      const userId = (request as any).user?.id || 'system';
      
      const association = await partnerService.associateWithCampaign(data, userId);
      reply.code(201).send(association);
    } catch (error) {
      app.log.error('Failed to create association:', error);
      reply.code(400).send({ error: 'Failed to create association' });
    }
  });

  app.get('/partners/campaigns/:campaignId/partners', {
    schema: {
      tags: ['Partners'],
      summary: 'Get partners for campaign',
      params: {
        type: 'object',
        properties: {
          campaignId: { type: 'string' }
        },
        required: ['campaignId']
      }
    }
  }, async (request) => {
    try {
      const { campaignId } = request.params as { campaignId: string };
      return await partnerService.getCampaignPartners(campaignId);
    } catch (error) {
      app.log.error('Failed to get campaign partners:', error);
      throw new Error('Failed to get campaign partners');
    }
  });

  // Capability comparison
  app.post('/partners/compare', {
    schema: {
      tags: ['Partners'],
      summary: 'Compare partner capabilities',
      body: {
        type: 'object',
        properties: {
          partnerIds: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 10 },
          categories: { type: 'array', items: { type: 'string' } },
          includeSpecs: { type: 'boolean', default: true },
          includePricing: { type: 'boolean', default: false },
          format: { type: 'string', enum: ['MATRIX', 'DETAILED', 'SUMMARY'], default: 'MATRIX' }
        },
        required: ['partnerIds']
      }
    }
  }, async (request) => {
    try {
      const data = CapabilityComparisonSchema.parse(request.body);
      return await partnerService.generateCapabilityComparison(data.partnerIds, data.categories);
    } catch (error) {
      app.log.error('Failed to generate comparison:', error);
      throw new Error('Failed to generate comparison');
    }
  });

  // Onboarding management
  app.patch('/partners/:id/onboarding', {
    schema: {
      tags: ['Partners'],
      summary: 'Update partner onboarding status',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' }
        },
        required: ['id']
      },
      body: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'FAILED'] },
          step: { type: 'string' }
        },
        required: ['status']
      }
    }
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const { status, step } = request.body as { status: any; step?: string };
      const userId = (request as any).user?.id || 'system';
      
      const partner = await partnerService.updateOnboardingStatus(id, status, step, userId);
      return partner;
    } catch (error) {
      app.log.error('Failed to update onboarding status:', error);
      reply.code(400).send({ error: 'Failed to update onboarding status' });
    }
  });
};