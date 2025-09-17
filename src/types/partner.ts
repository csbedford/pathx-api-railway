import { z } from 'zod';

export const PartnerTypeSchema = z.enum([
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

export const PartnerStatusSchema = z.enum([
  'PENDING',
  'ACTIVE',
  'INACTIVE', 
  'SUSPENDED',
  'ARCHIVED'
]);

export const OnboardingStatusSchema = z.enum([
  'NOT_STARTED',
  'IN_PROGRESS',
  'COMPLETED',
  'FAILED'
]);

export const ApiStatusSchema = z.enum([
  'HEALTHY',
  'DEGRADED',
  'DOWN',
  'UNKNOWN'
]);

export const CampaignPartnerStatusSchema = z.enum([
  'ASSOCIATED',
  'CONFIGURED',
  'LAUNCHED',
  'PAUSED',
  'COMPLETED',
  'FAILED'
]);

export const CapabilitySourceTypeSchema = z.enum([
  'MANUAL',
  'API_DISCOVERY',
  'DOCUMENTATION',
  'RATE_CARD',
  'FORM_SUBMISSION'
]);

export const CompanyInfoSchema = z.object({
  website: z.string().url().optional(),
  description: z.string().optional(),
  headquarters: z.string().optional(),
  foundedYear: z.number().optional(),
  employeeCount: z.string().optional(),
  industry: z.string().optional(),
  taxId: z.string().optional(),
  businessRegistration: z.string().optional()
});

export const ContactInfoSchema = z.object({
  primary: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    role: z.string().optional()
  }),
  technical: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    role: z.string().optional()
  }).optional(),
  billing: z.object({
    name: z.string(),
    email: z.string().email(),
    phone: z.string().optional(),
    role: z.string().optional()
  }).optional()
});

export const ApiCredentialsSchema = z.object({
  type: z.enum(['API_KEY', 'OAUTH2', 'JWT', 'BASIC_AUTH']),
  credentials: z.record(z.any()),
  endpoints: z.object({
    base: z.string().url(),
    auth: z.string().url().optional(),
    sandbox: z.string().url().optional()
  }),
  rateLimit: z.object({
    requests: z.number(),
    period: z.string(),
    concurrent: z.number().optional()
  }).optional(),
  lastTested: z.string().datetime().optional(),
  isActive: z.boolean().default(false)
});

export const TargetingOptionsSchema = z.object({
  demographics: z.object({
    age: z.boolean().default(false),
    gender: z.boolean().default(false),
    income: z.boolean().default(false),
    education: z.boolean().default(false),
    location: z.boolean().default(false)
  }).optional(),
  behavioral: z.object({
    interests: z.boolean().default(false),
    purchase_history: z.boolean().default(false),
    website_behavior: z.boolean().default(false),
    app_usage: z.boolean().default(false)
  }).optional(),
  contextual: z.object({
    keywords: z.boolean().default(false),
    content_category: z.boolean().default(false),
    device_type: z.boolean().default(false),
    time_of_day: z.boolean().default(false)
  }).optional(),
  custom: z.object({
    lookalike: z.boolean().default(false),
    custom_audiences: z.boolean().default(false),
    retargeting: z.boolean().default(false),
    geofencing: z.boolean().default(false)
  }).optional()
});

export const MeasurementCapabilitiesSchema = z.object({
  attribution: z.object({
    first_click: z.boolean().default(false),
    last_click: z.boolean().default(false),
    linear: z.boolean().default(false),
    time_decay: z.boolean().default(false),
    position_based: z.boolean().default(false),
    data_driven: z.boolean().default(false)
  }),
  tracking: z.object({
    impressions: z.boolean().default(true),
    clicks: z.boolean().default(true),
    conversions: z.boolean().default(false),
    view_through: z.boolean().default(false),
    cross_device: z.boolean().default(false)
  }),
  reporting: z.object({
    real_time: z.boolean().default(false),
    hourly: z.boolean().default(false),
    daily: z.boolean().default(true),
    custom_metrics: z.boolean().default(false),
    audience_insights: z.boolean().default(false)
  })
});

export const OnboardingStepsSchema = z.object({
  steps: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'SKIPPED']),
    required: z.boolean().default(true),
    order: z.number(),
    estimatedTime: z.string().optional(),
    dependencies: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional()
  })),
  currentStep: z.string().optional(),
  completedAt: z.string().datetime().optional(),
  failedAt: z.string().datetime().optional(),
  notes: z.string().optional()
});

export const PricingInfoSchema = z.object({
  model: z.enum(['CPM', 'CPC', 'CPA', 'FIXED', 'PERCENTAGE', 'HYBRID']),
  minimumSpend: z.number().optional(),
  rates: z.record(z.number()),
  currency: z.string().default('USD'),
  discounts: z.array(z.object({
    threshold: z.number(),
    rate: z.number(),
    description: z.string().optional()
  })).optional(),
  fees: z.object({
    setup: z.number().optional(),
    management: z.number().optional(),
    platform: z.number().optional()
  }).optional(),
  lastUpdated: z.string().datetime().optional()
});

export const CreatePartnerSchema = z.object({
  name: z.string().min(1),
  displayName: z.string().min(1),
  type: PartnerTypeSchema,
  companyInfo: CompanyInfoSchema,
  contactInfo: ContactInfoSchema,
  apiCredentials: ApiCredentialsSchema.optional(),
  targetingOptions: TargetingOptionsSchema.optional(),
  measurementCapabilities: MeasurementCapabilitiesSchema.optional(),
  pricingInfo: PricingInfoSchema.optional()
});

export const UpdatePartnerSchema = CreatePartnerSchema.partial();

export const PartnerHealthMetricSchema = z.object({
  timestamp: z.string().datetime(),
  apiStatus: ApiStatusSchema,
  responseTime: z.number().optional(),
  errorRate: z.number().optional(),
  uptime: z.number().optional(),
  lastError: z.string().optional(),
  healthScore: z.number().min(0).max(100).optional(),
  details: z.record(z.any()).optional()
});

export const PartnerCapabilitySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  details: z.record(z.any()),
  sourceType: CapabilitySourceTypeSchema,
  sourceData: z.record(z.any()).optional()
});

export const CreativeSpecSchema = z.object({
  format: z.string().min(1),
  dimensions: z.object({
    width: z.number(),
    height: z.number(),
    aspectRatio: z.string().optional()
  }),
  fileType: z.string().min(1),
  maxFileSize: z.number().positive(),
  requirements: z.record(z.any()),
  examples: z.record(z.any()).optional()
});

export const CampaignPartnerAssociationSchema = z.object({
  campaignId: z.string().uuid(),
  partnerId: z.string().uuid(),
  status: CampaignPartnerStatusSchema.optional(),
  budget: z.record(z.any()).optional(),
  targeting: z.record(z.any()).optional(),
  creative: z.record(z.any()).optional()
});

export const PartnerSearchSchema = z.object({
  query: z.string().optional(),
  type: PartnerTypeSchema.optional(),
  status: PartnerStatusSchema.optional(),
  capabilities: z.array(z.string()).optional(),
  minBudget: z.number().optional(),
  maxBudget: z.number().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.enum(['name', 'type', 'status', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});

export const BulkPartnerOperationSchema = z.object({
  partnerIds: z.array(z.string().uuid()).min(1),
  operation: z.enum(['ACTIVATE', 'DEACTIVATE', 'SUSPEND', 'ARCHIVE', 'DELETE']),
  reason: z.string().optional()
});

export const CapabilityComparisonSchema = z.object({
  partnerIds: z.array(z.string().uuid()).min(2).max(10),
  categories: z.array(z.string()).optional(),
  includeSpecs: z.boolean().default(true),
  includePricing: z.boolean().default(false),
  format: z.enum(['MATRIX', 'DETAILED', 'SUMMARY']).default('MATRIX')
});

export type PartnerType = z.infer<typeof PartnerTypeSchema>;
export type PartnerStatus = z.infer<typeof PartnerStatusSchema>;
export type OnboardingStatus = z.infer<typeof OnboardingStatusSchema>;
export type ApiStatus = z.infer<typeof ApiStatusSchema>;
export type CampaignPartnerStatus = z.infer<typeof CampaignPartnerStatusSchema>;
export type CapabilitySourceType = z.infer<typeof CapabilitySourceTypeSchema>;
export type CreatePartnerRequest = z.infer<typeof CreatePartnerSchema>;
export type UpdatePartnerRequest = z.infer<typeof UpdatePartnerSchema>;
export type PartnerHealthMetric = z.infer<typeof PartnerHealthMetricSchema>;
export type PartnerCapability = z.infer<typeof PartnerCapabilitySchema>;
export type CreativeSpec = z.infer<typeof CreativeSpecSchema>;
export type CampaignPartnerAssociation = z.infer<typeof CampaignPartnerAssociationSchema>;
export type PartnerSearchRequest = z.infer<typeof PartnerSearchSchema>;
export type BulkPartnerOperation = z.infer<typeof BulkPartnerOperationSchema>;
export type CapabilityComparison = z.infer<typeof CapabilityComparisonSchema>;