export interface CampaignTemplate {
    id: string;
    name: string;
    description: string;
    industry: string;
    type: 'brand_launch' | 'product_launch' | 'holiday' | 'awareness' | 'lead_generation' | 'sales';
    objectives: Array<{
        type: string;
        target: number;
        metric: string;
        priority: 'primary' | 'secondary';
    }>;
    budgetRange: {
        min: number;
        max: number;
        currency: string;
    };
    channelMix: Record<string, number>;
    duration: {
        weeks: number;
        phases?: Array<{
            name: string;
            weeks: number;
            focus: string;
        }>;
    };
    targetAudiences: Array<{
        name: string;
        demographics: Record<string, any>;
        size: number;
    }>;
    creativeRequirements: {
        formats: string[];
        guidelines: string[];
    };
    kpis: Array<{
        metric: string;
        target: number;
        timeframe: string;
    }>;
    tags: string[];
    usageCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface TemplateUsageAnalytics {
    templateId: string;
    usageCount: number;
    successRate: number;
    avgBudget: number;
    avgDuration: number;
    topIndustries: Array<{
        industry: string;
        count: number;
    }>;
    conversionMetrics: {
        templatesApplied: number;
        campaignsCreated: number;
        campaignsLaunched: number;
    };
}
export declare class CampaignTemplatesService {
    getAllTemplates(filters?: {
        industry?: string;
        type?: string;
        budgetRange?: {
            min?: number;
            max?: number;
        };
        isActive?: boolean;
    }): Promise<CampaignTemplate[]>;
    getTemplateById(id: string): Promise<CampaignTemplate | null>;
    getPopularTemplates(limit?: number): Promise<CampaignTemplate[]>;
    getTemplatesByIndustry(industry: string): Promise<CampaignTemplate[]>;
    createCustomTemplate(template: Omit<CampaignTemplate, 'id' | 'usageCount' | 'createdAt' | 'updatedAt'>): Promise<CampaignTemplate>;
    updateTemplateUsage(templateId: string): Promise<void>;
    getTemplateAnalytics(templateId?: string): Promise<TemplateUsageAnalytics | TemplateUsageAnalytics[]>;
    getIndustryBenchmarks(industry: string): Promise<{
        averageBudget: number;
        averageDuration: number;
        commonObjectives: Array<{
            type: string;
            frequency: number;
        }>;
        typicalChannelMix: Record<string, number>;
        successMetrics: Array<{
            metric: string;
            averageTarget: number;
        }>;
    }>;
    recommendTemplates(criteria: {
        industry?: string;
        budget?: number;
        objectives?: string[];
        timeline?: number;
    }): Promise<CampaignTemplate[]>;
}
export declare const campaignTemplatesService: CampaignTemplatesService;
//# sourceMappingURL=campaign-templates.d.ts.map