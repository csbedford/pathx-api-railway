"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CapabilityComparisonSchema = exports.BulkPartnerOperationSchema = exports.PartnerSearchSchema = exports.CampaignPartnerAssociationSchema = exports.CreativeSpecSchema = exports.PartnerCapabilitySchema = exports.PartnerHealthMetricSchema = exports.UpdatePartnerSchema = exports.CreatePartnerSchema = exports.PricingInfoSchema = exports.OnboardingStepsSchema = exports.MeasurementCapabilitiesSchema = exports.TargetingOptionsSchema = exports.ApiCredentialsSchema = exports.ContactInfoSchema = exports.CompanyInfoSchema = exports.CapabilitySourceTypeSchema = exports.CampaignPartnerStatusSchema = exports.ApiStatusSchema = exports.OnboardingStatusSchema = exports.PartnerStatusSchema = exports.PartnerTypeSchema = void 0;
const zod_1 = require("zod");
exports.PartnerTypeSchema = zod_1.z.enum([
    'DSP',
    'SOCIAL',
    'SEARCH',
    'RETAIL',
    'VIDEO',
    'NATIVE',
    'EMAIL',
    'AFFILIATE',
    'OTHER'
]);
exports.PartnerStatusSchema = zod_1.z.enum([
    'PENDING',
    'ACTIVE',
    'INACTIVE',
    'SUSPENDED',
    'ARCHIVED'
]);
exports.OnboardingStatusSchema = zod_1.z.enum([
    'NOT_STARTED',
    'IN_PROGRESS',
    'COMPLETED',
    'FAILED'
]);
exports.ApiStatusSchema = zod_1.z.enum([
    'HEALTHY',
    'DEGRADED',
    'DOWN',
    'UNKNOWN'
]);
exports.CampaignPartnerStatusSchema = zod_1.z.enum([
    'ASSOCIATED',
    'CONFIGURED',
    'LAUNCHED',
    'PAUSED',
    'COMPLETED',
    'FAILED'
]);
exports.CapabilitySourceTypeSchema = zod_1.z.enum([
    'MANUAL',
    'API_DISCOVERY',
    'DOCUMENTATION',
    'RATE_CARD',
    'FORM_SUBMISSION'
]);
exports.CompanyInfoSchema = zod_1.z.object({
    website: zod_1.z.string().url().optional(),
    description: zod_1.z.string().optional(),
    headquarters: zod_1.z.string().optional(),
    foundedYear: zod_1.z.number().optional(),
    employeeCount: zod_1.z.string().optional(),
    industry: zod_1.z.string().optional(),
    taxId: zod_1.z.string().optional(),
    businessRegistration: zod_1.z.string().optional()
});
exports.ContactInfoSchema = zod_1.z.object({
    primary: zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().optional(),
        role: zod_1.z.string().optional()
    }),
    technical: zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().optional(),
        role: zod_1.z.string().optional()
    }).optional(),
    billing: zod_1.z.object({
        name: zod_1.z.string(),
        email: zod_1.z.string().email(),
        phone: zod_1.z.string().optional(),
        role: zod_1.z.string().optional()
    }).optional()
});
exports.ApiCredentialsSchema = zod_1.z.object({
    type: zod_1.z.enum(['API_KEY', 'OAUTH2', 'JWT', 'BASIC_AUTH']),
    credentials: zod_1.z.record(zod_1.z.any()),
    endpoints: zod_1.z.object({
        base: zod_1.z.string().url(),
        auth: zod_1.z.string().url().optional(),
        sandbox: zod_1.z.string().url().optional()
    }),
    rateLimit: zod_1.z.object({
        requests: zod_1.z.number(),
        period: zod_1.z.string(),
        concurrent: zod_1.z.number().optional()
    }).optional(),
    lastTested: zod_1.z.string().datetime().optional(),
    isActive: zod_1.z.boolean().default(false)
});
exports.TargetingOptionsSchema = zod_1.z.object({
    demographics: zod_1.z.object({
        age: zod_1.z.boolean().default(false),
        gender: zod_1.z.boolean().default(false),
        income: zod_1.z.boolean().default(false),
        education: zod_1.z.boolean().default(false),
        location: zod_1.z.boolean().default(false)
    }).optional(),
    behavioral: zod_1.z.object({
        interests: zod_1.z.boolean().default(false),
        purchase_history: zod_1.z.boolean().default(false),
        website_behavior: zod_1.z.boolean().default(false),
        app_usage: zod_1.z.boolean().default(false)
    }).optional(),
    contextual: zod_1.z.object({
        keywords: zod_1.z.boolean().default(false),
        content_category: zod_1.z.boolean().default(false),
        device_type: zod_1.z.boolean().default(false),
        time_of_day: zod_1.z.boolean().default(false)
    }).optional(),
    custom: zod_1.z.object({
        lookalike: zod_1.z.boolean().default(false),
        custom_audiences: zod_1.z.boolean().default(false),
        retargeting: zod_1.z.boolean().default(false),
        geofencing: zod_1.z.boolean().default(false)
    }).optional()
});
exports.MeasurementCapabilitiesSchema = zod_1.z.object({
    attribution: zod_1.z.object({
        first_click: zod_1.z.boolean().default(false),
        last_click: zod_1.z.boolean().default(false),
        linear: zod_1.z.boolean().default(false),
        time_decay: zod_1.z.boolean().default(false),
        position_based: zod_1.z.boolean().default(false),
        data_driven: zod_1.z.boolean().default(false)
    }),
    tracking: zod_1.z.object({
        impressions: zod_1.z.boolean().default(true),
        clicks: zod_1.z.boolean().default(true),
        conversions: zod_1.z.boolean().default(false),
        view_through: zod_1.z.boolean().default(false),
        cross_device: zod_1.z.boolean().default(false)
    }),
    reporting: zod_1.z.object({
        real_time: zod_1.z.boolean().default(false),
        hourly: zod_1.z.boolean().default(false),
        daily: zod_1.z.boolean().default(true),
        custom_metrics: zod_1.z.boolean().default(false),
        audience_insights: zod_1.z.boolean().default(false)
    })
});
exports.OnboardingStepsSchema = zod_1.z.object({
    steps: zod_1.z.array(zod_1.z.object({
        id: zod_1.z.string(),
        name: zod_1.z.string(),
        description: zod_1.z.string(),
        status: zod_1.z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED']),
        required: zod_1.z.boolean().default(true),
        order: zod_1.z.number(),
        estimatedTime: zod_1.z.string().optional(),
        dependencies: zod_1.z.array(zod_1.z.string()).optional(),
        metadata: zod_1.z.record(zod_1.z.any()).optional()
    })),
    currentStep: zod_1.z.string().optional(),
    completedAt: zod_1.z.string().datetime().optional(),
    failedAt: zod_1.z.string().datetime().optional(),
    notes: zod_1.z.string().optional()
});
exports.PricingInfoSchema = zod_1.z.object({
    model: zod_1.z.enum(['CPM', 'CPC', 'CPA', 'FIXED', 'PERCENTAGE', 'HYBRID']),
    minimumSpend: zod_1.z.number().optional(),
    rates: zod_1.z.record(zod_1.z.number()),
    currency: zod_1.z.string().default('USD'),
    discounts: zod_1.z.array(zod_1.z.object({
        threshold: zod_1.z.number(),
        rate: zod_1.z.number(),
        description: zod_1.z.string().optional()
    })).optional(),
    fees: zod_1.z.object({
        setup: zod_1.z.number().optional(),
        management: zod_1.z.number().optional(),
        platform: zod_1.z.number().optional()
    }).optional(),
    lastUpdated: zod_1.z.string().datetime().optional()
});
exports.CreatePartnerSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    displayName: zod_1.z.string().min(1),
    type: exports.PartnerTypeSchema,
    companyInfo: exports.CompanyInfoSchema,
    contactInfo: exports.ContactInfoSchema,
    apiCredentials: exports.ApiCredentialsSchema.optional(),
    targetingOptions: exports.TargetingOptionsSchema.optional(),
    measurementCapabilities: exports.MeasurementCapabilitiesSchema.optional(),
    pricingInfo: exports.PricingInfoSchema.optional()
});
exports.UpdatePartnerSchema = exports.CreatePartnerSchema.partial();
exports.PartnerHealthMetricSchema = zod_1.z.object({
    timestamp: zod_1.z.string().datetime(),
    apiStatus: exports.ApiStatusSchema,
    responseTime: zod_1.z.number().optional(),
    errorRate: zod_1.z.number().optional(),
    uptime: zod_1.z.number().optional(),
    lastError: zod_1.z.string().optional(),
    healthScore: zod_1.z.number().min(0).max(100).optional(),
    details: zod_1.z.record(zod_1.z.any()).optional()
});
exports.PartnerCapabilitySchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    category: zod_1.z.string().min(1),
    details: zod_1.z.record(zod_1.z.any()),
    sourceType: exports.CapabilitySourceTypeSchema,
    sourceData: zod_1.z.record(zod_1.z.any()).optional()
});
exports.CreativeSpecSchema = zod_1.z.object({
    format: zod_1.z.string().min(1),
    dimensions: zod_1.z.object({
        width: zod_1.z.number(),
        height: zod_1.z.number(),
        aspectRatio: zod_1.z.string().optional()
    }),
    fileType: zod_1.z.string().min(1),
    maxFileSize: zod_1.z.number().positive(),
    requirements: zod_1.z.record(zod_1.z.any()),
    examples: zod_1.z.record(zod_1.z.any()).optional()
});
exports.CampaignPartnerAssociationSchema = zod_1.z.object({
    campaignId: zod_1.z.string().uuid(),
    partnerId: zod_1.z.string().uuid(),
    status: exports.CampaignPartnerStatusSchema.optional(),
    budget: zod_1.z.record(zod_1.z.any()).optional(),
    targeting: zod_1.z.record(zod_1.z.any()).optional(),
    creative: zod_1.z.record(zod_1.z.any()).optional()
});
exports.PartnerSearchSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    type: exports.PartnerTypeSchema.optional(),
    status: exports.PartnerStatusSchema.optional(),
    capabilities: zod_1.z.array(zod_1.z.string()).optional(),
    minBudget: zod_1.z.number().optional(),
    maxBudget: zod_1.z.number().optional(),
    page: zod_1.z.number().min(1).default(1),
    limit: zod_1.z.number().min(1).max(100).default(20),
    sortBy: zod_1.z.enum(['name', 'type', 'status', 'createdAt', 'updatedAt']).default('name'),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc')
});
exports.BulkPartnerOperationSchema = zod_1.z.object({
    partnerIds: zod_1.z.array(zod_1.z.string().uuid()).min(1),
    operation: zod_1.z.enum(['ACTIVATE', 'DEACTIVATE', 'SUSPEND', 'ARCHIVE', 'DELETE']),
    reason: zod_1.z.string().optional()
});
exports.CapabilityComparisonSchema = zod_1.z.object({
    partnerIds: zod_1.z.array(zod_1.z.string().uuid()).min(2).max(10),
    categories: zod_1.z.array(zod_1.z.string()).optional(),
    includeSpecs: zod_1.z.boolean().default(true),
    includePricing: zod_1.z.boolean().default(false),
    format: zod_1.z.enum(['MATRIX', 'DETAILED', 'SUMMARY']).default('MATRIX')
});
//# sourceMappingURL=partner.js.map