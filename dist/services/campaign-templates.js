"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignTemplatesService = exports.CampaignTemplatesService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Pre-built campaign templates
const PREDEFINED_TEMPLATES = [
    {
        name: 'Spirits Brand Launch',
        description: 'Comprehensive launch campaign for new alcoholic beverage brands',
        industry: 'Alcoholic Beverages',
        type: 'brand_launch',
        objectives: [
            { type: 'Brand Awareness', target: 2000000, metric: 'reach', priority: 'primary' },
            { type: 'Sales & Revenue', target: 500000, metric: 'revenue', priority: 'primary' },
            { type: 'Engagement', target: 5, metric: 'engagement_rate', priority: 'secondary' },
        ],
        budgetRange: {
            min: 250000,
            max: 1000000,
            currency: 'USD',
        },
        channelMix: {
            'Traditional Media': 35,
            'Digital Advertising': 30,
            'Events & Activations': 20,
            'Influencer Marketing': 10,
            'Social Media': 5,
        },
        duration: {
            weeks: 16,
            phases: [
                { name: 'Pre-Launch Awareness', weeks: 4, focus: 'Brand introduction and teasing' },
                { name: 'Launch Activation', weeks: 6, focus: 'Product availability and purchase' },
                { name: 'Sustaining Campaign', weeks: 6, focus: 'Maintaining momentum and loyalty' },
            ],
        },
        targetAudiences: [
            {
                name: 'Premium Spirits Enthusiasts',
                demographics: { ageRange: '25-54', gender: 'All', income: '$75k+', interests: ['Premium Alcohol', 'Entertaining'] },
                size: 1500000,
            },
            {
                name: 'Social Drinkers',
                demographics: { ageRange: '21-44', gender: 'All', income: '$50k+', interests: ['Nightlife', 'Social Events'] },
                size: 2500000,
            },
        ],
        creativeRequirements: {
            formats: ['Video Ads', 'Display Banners', 'Social Media Posts', 'Out-of-Home'],
            guidelines: ['Age-gate compliance', 'Responsible drinking messaging', 'Premium brand positioning'],
        },
        kpis: [
            { metric: 'Brand Awareness Lift', target: 15, timeframe: '16 weeks' },
            { metric: 'Sales Volume', target: 50000, timeframe: '16 weeks' },
            { metric: 'Market Share', target: 2, timeframe: '16 weeks' },
        ],
        tags: ['alcohol', 'launch', 'premium', 'awareness'],
        isActive: true,
    },
    {
        name: 'E-commerce Holiday Campaign',
        description: 'High-impact holiday shopping campaign for e-commerce brands',
        industry: 'E-commerce',
        type: 'holiday',
        objectives: [
            { type: 'Sales & Revenue', target: 2000000, metric: 'revenue', priority: 'primary' },
            { type: 'Traffic & Acquisition', target: 500000, metric: 'website_visits', priority: 'primary' },
            { type: 'Lead Generation', target: 15, metric: 'conversion_rate', priority: 'secondary' },
        ],
        budgetRange: {
            min: 500000,
            max: 2000000,
            currency: 'USD',
        },
        channelMix: {
            'Digital Advertising': 45,
            'Social Media': 25,
            'Email Marketing': 15,
            'Influencer Marketing': 10,
            'Affiliate Marketing': 5,
        },
        duration: {
            weeks: 12,
            phases: [
                { name: 'Early Bird', weeks: 4, focus: 'Early holiday promotions and awareness' },
                { name: 'Peak Season', weeks: 6, focus: 'Maximum sales push during holiday peak' },
                { name: 'Post-Holiday', weeks: 2, focus: 'Clearance and customer retention' },
            ],
        },
        targetAudiences: [
            {
                name: 'Holiday Shoppers',
                demographics: { ageRange: '25-54', gender: 'All', income: '$40k+', interests: ['Online Shopping', 'Holiday Gifts'] },
                size: 5000000,
            },
            {
                name: 'Last-Minute Shoppers',
                demographics: { ageRange: '18-44', gender: 'All', income: '$30k+', interests: ['Convenience', 'Fast Shipping'] },
                size: 2000000,
            },
        ],
        creativeRequirements: {
            formats: ['Video Ads', 'Display Banners', 'Social Media Posts', 'Email Templates'],
            guidelines: ['Holiday branding', 'Urgency messaging', 'Gift-focused creative'],
        },
        kpis: [
            { metric: 'Revenue Growth', target: 300, timeframe: '12 weeks' },
            { metric: 'Conversion Rate', target: 15, timeframe: '12 weeks' },
            { metric: 'Customer Acquisition', target: 100000, timeframe: '12 weeks' },
        ],
        tags: ['ecommerce', 'holiday', 'sales', 'seasonal'],
        isActive: true,
    },
    {
        name: 'CPG Product Launch',
        description: 'Mass market launch for consumer packaged goods',
        industry: 'Consumer Goods',
        type: 'product_launch',
        objectives: [
            { type: 'Brand Awareness', target: 10000000, metric: 'impressions', priority: 'primary' },
            { type: 'Sales & Revenue', target: 1000000, metric: 'units_sold', priority: 'primary' },
            { type: 'Traffic & Acquisition', target: 25, metric: 'click_through_rate', priority: 'secondary' },
        ],
        budgetRange: {
            min: 750000,
            max: 3000000,
            currency: 'USD',
        },
        channelMix: {
            'Traditional Media': 40,
            'Digital Advertising': 25,
            'Retail Marketing': 20,
            'Social Media': 10,
            'Sampling & Events': 5,
        },
        duration: {
            weeks: 20,
            phases: [
                { name: 'Awareness Building', weeks: 6, focus: 'Product introduction and education' },
                { name: 'Retail Launch', weeks: 8, focus: 'Driving trial and purchase' },
                { name: 'Momentum Sustain', weeks: 6, focus: 'Building repeat purchase and loyalty' },
            ],
        },
        targetAudiences: [
            {
                name: 'Primary Shoppers',
                demographics: { ageRange: '25-54', gender: 'Female-skewed', income: '$35k+', interests: ['Household Products', 'Value'] },
                size: 8000000,
            },
            {
                name: 'Early Adopters',
                demographics: { ageRange: '18-44', gender: 'All', income: '$50k+', interests: ['New Products', 'Quality'] },
                size: 3000000,
            },
        ],
        creativeRequirements: {
            formats: ['TV Commercials', 'Display Banners', 'Social Media Posts', 'In-Store Materials'],
            guidelines: ['Product demonstration', 'Benefit-focused messaging', 'Mass appeal'],
        },
        kpis: [
            { metric: 'Product Trial Rate', target: 20, timeframe: '20 weeks' },
            { metric: 'Retail Distribution', target: 85, timeframe: '20 weeks' },
            { metric: 'Market Penetration', target: 5, timeframe: '20 weeks' },
        ],
        tags: ['cpg', 'launch', 'mass-market', 'retail'],
        isActive: true,
    },
    {
        name: 'Automotive Model Year Campaign',
        description: 'Annual model launch campaign for automotive brands',
        industry: 'Automotive',
        type: 'product_launch',
        objectives: [
            { type: 'Lead Generation', target: 5000, metric: 'qualified_leads', priority: 'primary' },
            { type: 'Brand Awareness', target: 20000000, metric: 'impressions', priority: 'primary' },
            { type: 'Traffic & Acquisition', target: 200000, metric: 'website_visits', priority: 'secondary' },
        ],
        budgetRange: {
            min: 2000000,
            max: 8000000,
            currency: 'USD',
        },
        channelMix: {
            'Traditional Media': 45,
            'Digital Advertising': 25,
            'Dealer Marketing': 15,
            'Events & Shows': 10,
            'Social Media': 5,
        },
        duration: {
            weeks: 26,
            phases: [
                { name: 'Pre-Launch Teaser', weeks: 4, focus: 'Building anticipation and interest' },
                { name: 'Model Reveal', weeks: 8, focus: 'Showcasing features and capabilities' },
                { name: 'Sales Drive', weeks: 14, focus: 'Converting interest to dealership visits and sales' },
            ],
        },
        targetAudiences: [
            {
                name: 'Car Intenders',
                demographics: { ageRange: '25-64', gender: 'All', income: '$60k+', interests: ['Automotive', 'Technology'] },
                size: 2000000,
            },
            {
                name: 'Luxury Buyers',
                demographics: { ageRange: '35-65', gender: 'All', income: '$100k+', interests: ['Luxury', 'Performance'] },
                size: 800000,
            },
        ],
        creativeRequirements: {
            formats: ['Video Ads', 'Display Banners', 'Interactive Configurators', 'VR Experiences'],
            guidelines: ['Product hero shots', 'Feature demonstrations', 'Lifestyle integration'],
        },
        kpis: [
            { metric: 'Test Drive Bookings', target: 15000, timeframe: '26 weeks' },
            { metric: 'Dealer Leads', target: 50000, timeframe: '26 weeks' },
            { metric: 'Sales Conversion', target: 12, timeframe: '26 weeks' },
        ],
        tags: ['automotive', 'launch', 'luxury', 'technology'],
        isActive: true,
    },
];
class CampaignTemplatesService {
    async getAllTemplates(filters) {
        // In a real implementation, this would query the database
        // For now, return predefined templates with filtering
        let templates = PREDEFINED_TEMPLATES.map((template, index) => ({
            ...template,
            id: `template_${index + 1}`,
            usageCount: Math.floor(Math.random() * 500) + 50,
            createdAt: new Date(),
            updatedAt: new Date(),
        }));
        if (filters) {
            if (filters.industry) {
                templates = templates.filter(t => t.industry === filters.industry);
            }
            if (filters.type) {
                templates = templates.filter(t => t.type === filters.type);
            }
            if (filters.budgetRange) {
                templates = templates.filter(t => {
                    const matchesMin = !filters.budgetRange?.min || t.budgetRange.max >= filters.budgetRange.min;
                    const matchesMax = !filters.budgetRange?.max || t.budgetRange.min <= filters.budgetRange.max;
                    return matchesMin && matchesMax;
                });
            }
            if (filters.isActive !== undefined) {
                templates = templates.filter(t => t.isActive === filters.isActive);
            }
        }
        return templates;
    }
    async getTemplateById(id) {
        const templates = await this.getAllTemplates();
        return templates.find(t => t.id === id) || null;
    }
    async getPopularTemplates(limit = 5) {
        const templates = await this.getAllTemplates({ isActive: true });
        return templates
            .sort((a, b) => b.usageCount - a.usageCount)
            .slice(0, limit);
    }
    async getTemplatesByIndustry(industry) {
        return this.getAllTemplates({ industry, isActive: true });
    }
    async createCustomTemplate(template) {
        // In a real implementation, this would save to database
        const newTemplate = {
            ...template,
            id: `custom_${Date.now()}`,
            usageCount: 0,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        return newTemplate;
    }
    async updateTemplateUsage(templateId) {
        // In a real implementation, this would increment usage count in database
        console.log(`Updated usage count for template: ${templateId}`);
    }
    async getTemplateAnalytics(templateId) {
        // Mock analytics data
        const mockAnalytics = (id) => ({
            templateId: id,
            usageCount: Math.floor(Math.random() * 500) + 50,
            successRate: Math.random() * 40 + 60, // 60-100%
            avgBudget: Math.floor(Math.random() * 1000000) + 500000,
            avgDuration: Math.floor(Math.random() * 20) + 8, // 8-28 weeks
            topIndustries: [
                { industry: 'Consumer Goods', count: Math.floor(Math.random() * 50) + 10 },
                { industry: 'Technology', count: Math.floor(Math.random() * 30) + 5 },
                { industry: 'Automotive', count: Math.floor(Math.random() * 20) + 3 },
            ],
            conversionMetrics: {
                templatesApplied: Math.floor(Math.random() * 1000) + 200,
                campaignsCreated: Math.floor(Math.random() * 800) + 150,
                campaignsLaunched: Math.floor(Math.random() * 600) + 100,
            },
        });
        if (templateId) {
            return mockAnalytics(templateId);
        }
        const templates = await this.getAllTemplates();
        return templates.map(t => mockAnalytics(t.id));
    }
    async getIndustryBenchmarks(industry) {
        // Mock industry benchmarks
        const benchmarks = {
            'Consumer Goods': {
                averageBudget: 750000,
                averageDuration: 16,
                commonObjectives: [
                    { type: 'Brand Awareness', frequency: 85 },
                    { type: 'Sales & Revenue', frequency: 90 },
                    { type: 'Market Share', frequency: 60 },
                ],
                typicalChannelMix: {
                    'Traditional Media': 35,
                    'Digital Advertising': 30,
                    'Retail Marketing': 20,
                    'Social Media': 15,
                },
                successMetrics: [
                    { metric: 'Awareness Lift', averageTarget: 12 },
                    { metric: 'Sales Growth', averageTarget: 25 },
                    { metric: 'Market Share', averageTarget: 3 },
                ],
            },
            'Technology': {
                averageBudget: 1200000,
                averageDuration: 20,
                commonObjectives: [
                    { type: 'Lead Generation', frequency: 95 },
                    { type: 'Brand Awareness', frequency: 80 },
                    { type: 'Thought Leadership', frequency: 70 },
                ],
                typicalChannelMix: {
                    'Digital Advertising': 45,
                    'Content Marketing': 25,
                    'Events & Webinars': 15,
                    'Social Media': 15,
                },
                successMetrics: [
                    { metric: 'Lead Generation', averageTarget: 2500 },
                    { metric: 'Conversion Rate', averageTarget: 8 },
                    { metric: 'Pipeline Value', averageTarget: 5000000 },
                ],
            },
        };
        return benchmarks[industry] || benchmarks['Consumer Goods'];
    }
    async recommendTemplates(criteria) {
        const allTemplates = await this.getAllTemplates({ isActive: true });
        // Score templates based on criteria match
        const scoredTemplates = allTemplates.map(template => {
            let score = 0;
            // Industry match (high weight)
            if (criteria.industry && template.industry === criteria.industry) {
                score += 50;
            }
            // Budget match (medium weight)
            if (criteria.budget) {
                if (criteria.budget >= template.budgetRange.min && criteria.budget <= template.budgetRange.max) {
                    score += 30;
                }
                else if (Math.abs(criteria.budget - template.budgetRange.min) / template.budgetRange.min < 0.5) {
                    score += 15; // Close to budget range
                }
            }
            // Objectives match (medium weight)
            if (criteria.objectives && criteria.objectives.length > 0) {
                const matchingObjectives = template.objectives.filter(obj => criteria.objectives.includes(obj.type));
                score += (matchingObjectives.length / criteria.objectives.length) * 25;
            }
            // Timeline match (low weight)
            if (criteria.timeline && template.duration.weeks) {
                const weeksDiff = Math.abs(criteria.timeline - template.duration.weeks);
                if (weeksDiff <= 2)
                    score += 15;
                else if (weeksDiff <= 4)
                    score += 10;
                else if (weeksDiff <= 8)
                    score += 5;
            }
            // Usage popularity bonus (low weight)
            score += Math.min(template.usageCount / 100, 10);
            return { template, score };
        });
        // Return top 3 recommendations
        return scoredTemplates
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map(item => item.template);
    }
}
exports.CampaignTemplatesService = CampaignTemplatesService;
exports.campaignTemplatesService = new CampaignTemplatesService();
//# sourceMappingURL=campaign-templates.js.map