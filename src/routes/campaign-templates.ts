import { FastifyInstance } from 'fastify';
import { campaignTemplatesService } from '../services/campaign-templates.js';

export async function campaignTemplatesRoutes(fastify: FastifyInstance) {
  
  // Get all templates with optional filters
  fastify.get('/templates', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          industry: { type: 'string' },
          type: { type: 'string' },
          minBudget: { type: 'number' },
          maxBudget: { type: 'number' },
          isActive: { type: 'boolean' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { industry, type, minBudget, maxBudget, isActive } = request.query as any;
      
      const filters: any = {};
      if (industry) filters.industry = industry;
      if (type) filters.type = type;
      if (isActive !== undefined) filters.isActive = isActive;
      if (minBudget || maxBudget) {
        filters.budgetRange = {};
        if (minBudget) filters.budgetRange.min = minBudget;
        if (maxBudget) filters.budgetRange.max = maxBudget;
      }

      const templates = await campaignTemplatesService.getAllTemplates(filters);
      
      return {
        success: true,
        data: templates,
        count: templates.length,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch campaign templates',
      });
    }
  });

  // Get template by ID
  fastify.get('/templates/:id', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const template = await campaignTemplatesService.getTemplateById(id);
      
      if (!template) {
        return reply.status(404).send({
          success: false,
          error: 'Template not found',
        });
      }

      return {
        success: true,
        data: template,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch campaign template',
      });
    }
  });

  // Get popular templates
  fastify.get('/templates/popular/:limit?', {
    schema: {
      params: {
        type: 'object',
        properties: {
          limit: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { limit } = request.params as { limit?: string };
      const limitNum = limit ? parseInt(limit, 10) : 5;
      
      const templates = await campaignTemplatesService.getPopularTemplates(limitNum);
      
      return {
        success: true,
        data: templates,
        count: templates.length,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch popular templates',
      });
    }
  });

  // Get templates by industry
  fastify.get('/templates/industry/:industry', {
    schema: {
      params: {
        type: 'object',
        properties: {
          industry: { type: 'string' },
        },
        required: ['industry'],
      },
    },
  }, async (request, reply) => {
    try {
      const { industry } = request.params as { industry: string };
      const templates = await campaignTemplatesService.getTemplatesByIndustry(industry);
      
      return {
        success: true,
        data: templates,
        count: templates.length,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch templates by industry',
      });
    }
  });

  // Create custom template
  fastify.post('/templates', {
    schema: {
      body: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          industry: { type: 'string' },
          type: { type: 'string' },
          objectives: { type: 'array' },
          budgetRange: { type: 'object' },
          channelMix: { type: 'object' },
          duration: { type: 'object' },
          targetAudiences: { type: 'array' },
          creativeRequirements: { type: 'object' },
          kpis: { type: 'array' },
          tags: { type: 'array' },
          isActive: { type: 'boolean' },
        },
        required: ['name', 'industry', 'type'],
      },
    },
  }, async (request, reply) => {
    try {
      const templateData = request.body as any;
      const template = await campaignTemplatesService.createCustomTemplate(templateData);
      
      return reply.status(201).send({
        success: true,
        data: template,
      });
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to create campaign template',
      });
    }
  });

  // Update template usage
  fastify.post('/templates/:id/usage', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      await campaignTemplatesService.updateTemplateUsage(id);
      
      return {
        success: true,
        message: 'Template usage updated',
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to update template usage',
      });
    }
  });

  // Get template analytics
  fastify.get('/templates/analytics/:id?', {
    schema: {
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id?: string };
      const analytics = await campaignTemplatesService.getTemplateAnalytics(id);
      
      return {
        success: true,
        data: analytics,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch template analytics',
      });
    }
  });

  // Get industry benchmarks
  fastify.get('/benchmarks/:industry', {
    schema: {
      params: {
        type: 'object',
        properties: {
          industry: { type: 'string' },
        },
        required: ['industry'],
      },
    },
  }, async (request, reply) => {
    try {
      const { industry } = request.params as { industry: string };
      const benchmarks = await campaignTemplatesService.getIndustryBenchmarks(industry);
      
      return {
        success: true,
        data: benchmarks,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to fetch industry benchmarks',
      });
    }
  });

  // Get template recommendations
  fastify.post('/templates/recommend', {
    schema: {
      body: {
        type: 'object',
        properties: {
          industry: { type: 'string' },
          budget: { type: 'number' },
          objectives: { type: 'array', items: { type: 'string' } },
          timeline: { type: 'number' },
        },
      },
    },
  }, async (request, reply) => {
    try {
      const criteria = request.body as any;
      const recommendations = await campaignTemplatesService.recommendTemplates(criteria);
      
      return {
        success: true,
        data: recommendations,
        count: recommendations.length,
      };
    } catch (error) {
      fastify.log.error(error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to generate template recommendations',
      });
    }
  });
}