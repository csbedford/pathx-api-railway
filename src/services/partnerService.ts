import { PrismaClient } from '@prisma/client';
import type { 
  CreatePartnerRequest, 
  UpdatePartnerRequest, 
  PartnerSearchRequest,
  BulkPartnerOperation,
  PartnerHealthMetric,
  PartnerCapability,
  CreativeSpec,
  CampaignPartnerAssociation,
  PartnerStatus,
  OnboardingStatus
} from '../types/partner.js';

export class PartnerService {
  constructor(private prisma: PrismaClient) {}

  async createPartner(data: CreatePartnerRequest, userId: string) {
    const partner = await this.prisma.partner.create({
      data: {
        name: data.name,
        displayName: data.displayName,
        type: data.type,
        companyInfo: data.companyInfo as any,
        contactInfo: data.contactInfo as any,
        apiCredentials: data.apiCredentials as any,
        targetingOptions: data.targetingOptions || {},
        measurementCapabilities: data.measurementCapabilities || {},
        onboardingSteps: this.generateDefaultOnboardingSteps(),
        pricingInfo: data.pricingInfo || {}
      },
      include: {
        capabilities: true,
        creativeSpecs: true,
        healthMetrics: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    await this.logAuditEvent('PARTNER_CREATED', partner.id, userId, { partnerName: data.name });
    return partner;
  }

  async getPartner(id: string) {
    return this.prisma.partner.findUnique({
      where: { id },
      include: {
        capabilities: true,
        creativeSpecs: true,
        healthMetrics: {
          orderBy: { timestamp: 'desc' },
          take: 10
        },
        campaignAssociations: {
          include: {
            campaign: {
              select: { id: true, name: true, status: true }
            }
          }
        }
      }
    });
  }

  async updatePartner(id: string, data: UpdatePartnerRequest, userId: string) {
    const existingPartner = await this.prisma.partner.findUnique({ 
      where: { id },
      select: { name: true, status: true, onboardingStatus: true }
    });

    if (!existingPartner) {
      throw new Error('Partner not found');
    }

    const partner = await this.prisma.partner.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.displayName && { displayName: data.displayName }),
        ...(data.type && { type: data.type }),
        ...(data.companyInfo && { companyInfo: data.companyInfo as any }),
        ...(data.contactInfo && { contactInfo: data.contactInfo as any }),
        ...(data.apiCredentials && { apiCredentials: data.apiCredentials as any }),
        ...(data.targetingOptions && { targetingOptions: data.targetingOptions as any }),
        ...(data.measurementCapabilities && { measurementCapabilities: data.measurementCapabilities as any }),
        ...(data.pricingInfo && { pricingInfo: data.pricingInfo as any })
      },
      include: {
        capabilities: true,
        creativeSpecs: true,
        healthMetrics: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    await this.logAuditEvent('PARTNER_UPDATED', id, userId, { 
      changes: Object.keys(data),
      previousStatus: existingPartner.status 
    });

    return partner;
  }

  async searchPartners(params: PartnerSearchRequest) {
    const { query, type, status, capabilities, minBudget, maxBudget, page, limit, sortBy, sortOrder } = params;
    
    const where: any = {};
    
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { displayName: { contains: query, mode: 'insensitive' } }
      ];
    }
    
    if (type) where.type = type;
    if (status) where.status = status;
    
    if (capabilities && capabilities.length > 0) {
      where.capabilities = {
        some: {
          name: { in: capabilities }
        }
      };
    }

    const skip = (page - 1) * limit;
    const orderBy = { [sortBy]: sortOrder };

    const [partners, total] = await Promise.all([
      this.prisma.partner.findMany({
        where,
        include: {
          capabilities: {
            select: { name: true, category: true }
          },
          healthMetrics: {
            orderBy: { timestamp: 'desc' },
            take: 1
          },
          _count: {
            select: { campaignAssociations: true }
          }
        },
        skip,
        take: limit,
        orderBy
      }),
      this.prisma.partner.count({ where })
    ]);

    return {
      partners,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async bulkOperation(operation: BulkPartnerOperation, userId: string) {
    const { partnerIds, operation: op, reason } = operation;
    
    const statusMap = {
      ACTIVATE: 'ACTIVE',
      DEACTIVATE: 'INACTIVE',
      SUSPEND: 'SUSPENDED',
      ARCHIVE: 'ARCHIVED'
    } as const;

    if (op === 'DELETE') {
      await this.prisma.partner.deleteMany({
        where: { id: { in: partnerIds } }
      });
    } else {
      await this.prisma.partner.updateMany({
        where: { id: { in: partnerIds } },
        data: { status: statusMap[op] as PartnerStatus }
      });
    }

    await this.logAuditEvent('PARTNER_BULK_OPERATION', 'bulk', userId, {
      operation: op,
      partnerIds,
      reason,
      count: partnerIds.length
    });

    return { success: true, affectedCount: partnerIds.length };
  }

  async updatePartnerStatus(id: string, status: PartnerStatus, userId: string) {
    const partner = await this.prisma.partner.update({
      where: { id },
      data: { status },
      select: { name: true, status: true }
    });

    await this.logAuditEvent('PARTNER_STATUS_CHANGED', id, userId, { 
      newStatus: status,
      partnerName: partner.name 
    });

    return partner;
  }

  async updateOnboardingStatus(id: string, status: OnboardingStatus, step?: string, userId?: string) {
    const updateData: any = { onboardingStatus: status };
    
    if (step) {
      const partner = await this.prisma.partner.findUnique({
        where: { id },
        select: { onboardingSteps: true }
      });

      if (partner?.onboardingSteps) {
        const steps = partner.onboardingSteps as any;
        if (steps.steps) {
          const stepIndex = steps.steps.findIndex((s: any) => s.id === step);
          if (stepIndex !== -1) {
            steps.steps[stepIndex].status = status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';
            steps.currentStep = step;
          }
          updateData.onboardingSteps = steps;
        }
      }
    }

    const partner = await this.prisma.partner.update({
      where: { id },
      data: updateData,
      select: { name: true, onboardingStatus: true }
    });

    if (userId) {
      await this.logAuditEvent('PARTNER_ONBOARDING_UPDATED', id, userId, { 
        newStatus: status,
        step,
        partnerName: partner.name 
      });
    }

    return partner;
  }

  async recordHealthMetric(partnerId: string, metric: PartnerHealthMetric) {
    return this.prisma.partnerHealthMetric.create({
      data: {
        partnerId,
        timestamp: new Date(metric.timestamp),
        apiStatus: metric.apiStatus,
        responseTime: metric.responseTime,
        errorRate: metric.errorRate,
        uptime: metric.uptime,
        lastError: metric.lastError,
        healthScore: metric.healthScore,
        details: metric.details as any
      }
    });
  }

  async getPartnerHealth(partnerId: string, days: number = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.prisma.partnerHealthMetric.findMany({
      where: {
        partnerId,
        timestamp: { gte: since }
      },
      orderBy: { timestamp: 'desc' }
    });
  }

  async addCapability(partnerId: string, capability: PartnerCapability, userId: string) {
    const result = await this.prisma.partnerCapability.create({
      data: {
        partnerId,
        name: capability.name,
        description: capability.description,
        category: capability.category,
        details: capability.details as any,
        sourceType: capability.sourceType,
        sourceData: capability.sourceData as any
      }
    });

    await this.logAuditEvent('PARTNER_CAPABILITY_ADDED', partnerId, userId, { 
      capability: capability.name,
      category: capability.category 
    });

    return result;
  }

  async addCreativeSpec(partnerId: string, spec: CreativeSpec, userId: string) {
    const result = await this.prisma.creativeSpec.create({
      data: {
        partnerId,
        format: spec.format,
        dimensions: spec.dimensions as any,
        fileType: spec.fileType,
        maxFileSize: spec.maxFileSize,
        requirements: spec.requirements as any,
        examples: spec.examples as any
      }
    });

    await this.logAuditEvent('PARTNER_CREATIVE_SPEC_ADDED', partnerId, userId, { 
      format: spec.format,
      fileType: spec.fileType 
    });

    return result;
  }

  async associateWithCampaign(association: CampaignPartnerAssociation, userId: string) {
    const result = await this.prisma.campaignPartner.create({
      data: {
        campaignId: association.campaignId,
        partnerId: association.partnerId,
        status: association.status || 'ASSOCIATED',
        budget: association.budget as any,
        targeting: association.targeting as any,
        creative: association.creative as any
      },
      include: {
        campaign: { select: { name: true } },
        partner: { select: { name: true } }
      }
    });

    await this.logAuditEvent('CAMPAIGN_PARTNER_ASSOCIATED', association.campaignId, userId, {
      partnerId: association.partnerId,
      campaignName: result.campaign.name,
      partnerName: result.partner.name
    });

    return result;
  }

  async getCampaignPartners(campaignId: string) {
    return this.prisma.campaignPartner.findMany({
      where: { campaignId },
      include: {
        partner: {
          include: {
            capabilities: {
              select: { name: true, category: true }
            },
            healthMetrics: {
              orderBy: { timestamp: 'desc' },
              take: 1
            }
          }
        }
      }
    });
  }

  async generateCapabilityComparison(partnerIds: string[], categories?: string[]) {
    const partners = await this.prisma.partner.findMany({
      where: { id: { in: partnerIds } },
      include: {
        capabilities: categories ? {
          where: { category: { in: categories } }
        } : true,
        creativeSpecs: true
      }
    });

    const comparison: any = {
      partners: partners.map(p => ({ id: p.id, name: p.name, type: p.type })),
      capabilities: {},
      creativeSpecs: {},
      targeting: {},
      measurement: {}
    };

    partners.forEach(partner => {
      partner.capabilities.forEach(cap => {
        if (!comparison.capabilities[cap.category]) {
          comparison.capabilities[cap.category] = {};
        }
        if (!comparison.capabilities[cap.category][cap.name]) {
          comparison.capabilities[cap.category][cap.name] = {};
        }
        comparison.capabilities[cap.category][cap.name][partner.id] = {
          supported: true,
          details: cap.details
        };
      });

      partner.creativeSpecs.forEach(spec => {
        if (!comparison.creativeSpecs[spec.format]) {
          comparison.creativeSpecs[spec.format] = {};
        }
        comparison.creativeSpecs[spec.format][partner.id] = {
          dimensions: spec.dimensions,
          fileType: spec.fileType,
          maxFileSize: spec.maxFileSize,
          requirements: spec.requirements
        };
      });

      comparison.targeting[partner.id] = partner.targetingOptions;
      comparison.measurement[partner.id] = partner.measurementCapabilities;
    });

    return comparison;
  }

  private generateDefaultOnboardingSteps() {
    return {
      steps: [
        {
          id: 'company_verification',
          name: 'Company Verification',
          description: 'Verify company information and legal status',
          status: 'PENDING',
          required: true,
          order: 1,
          estimatedTime: '1-2 business days'
        },
        {
          id: 'api_setup',
          name: 'API Integration Setup',
          description: 'Configure API credentials and test connectivity',
          status: 'PENDING',
          required: true,
          order: 2,
          estimatedTime: '2-4 hours',
          dependencies: ['company_verification']
        },
        {
          id: 'capabilities_review',
          name: 'Capabilities Review',
          description: 'Review and confirm advertising capabilities',
          status: 'PENDING',
          required: true,
          order: 3,
          estimatedTime: '1 hour',
          dependencies: ['api_setup']
        },
        {
          id: 'test_campaign',
          name: 'Test Campaign',
          description: 'Run a small test campaign to validate integration',
          status: 'PENDING',
          required: false,
          order: 4,
          estimatedTime: '3-5 days',
          dependencies: ['capabilities_review']
        },
        {
          id: 'go_live',
          name: 'Go Live',
          description: 'Activate partner for production campaigns',
          status: 'PENDING',
          required: true,
          order: 5,
          estimatedTime: '30 minutes',
          dependencies: ['test_campaign']
        }
      ],
      currentStep: 'company_verification'
    };
  }

  private async logAuditEvent(action: string, entityId: string, userId: string, changes: any) {
    return this.prisma.auditLog.create({
      data: {
        entityType: 'PARTNER',
        entityId,
        action,
        actorId: userId,
        changes: changes as any
      }
    });
  }
}