import { PrismaClient } from '@prisma/client';
import type { CreatePartnerRequest, UpdatePartnerRequest, PartnerSearchRequest, BulkPartnerOperation, PartnerHealthMetric, PartnerCapability, CreativeSpec, CampaignPartnerAssociation, PartnerStatus, OnboardingStatus } from '../types/partner.js';
export declare class PartnerService {
    private prisma;
    constructor(prisma: PrismaClient);
    createPartner(data: CreatePartnerRequest, userId: string): Promise<{
        capabilities: {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            isActive: boolean;
            lastUpdated: Date;
            details: import("@prisma/client/runtime/library.js").JsonValue;
            category: string;
            sourceType: import(".prisma/client").$Enums.CapabilitySourceType;
            sourceData: import("@prisma/client/runtime/library.js").JsonValue | null;
        }[];
        creativeSpecs: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            requirements: import("@prisma/client/runtime/library.js").JsonValue;
            isActive: boolean;
            format: string;
            dimensions: import("@prisma/client/runtime/library.js").JsonValue;
            fileType: string;
            maxFileSize: number;
            examples: import("@prisma/client/runtime/library.js").JsonValue | null;
        }[];
        healthMetrics: {
            timestamp: Date;
            uptime: number | null;
            id: string;
            partnerId: string;
            apiStatus: import(".prisma/client").$Enums.ApiStatus;
            responseTime: number | null;
            errorRate: number | null;
            lastError: string | null;
            healthScore: number | null;
            details: import("@prisma/client/runtime/library.js").JsonValue | null;
        }[];
    } & {
        type: import(".prisma/client").$Enums.PartnerType;
        status: import(".prisma/client").$Enums.PartnerStatus;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayName: string;
        companyInfo: import("@prisma/client/runtime/library.js").JsonValue;
        contactInfo: import("@prisma/client/runtime/library.js").JsonValue;
        apiCredentials: import("@prisma/client/runtime/library.js").JsonValue | null;
        targetingOptions: import("@prisma/client/runtime/library.js").JsonValue;
        measurementCapabilities: import("@prisma/client/runtime/library.js").JsonValue;
        pricingInfo: import("@prisma/client/runtime/library.js").JsonValue;
        onboardingStatus: import(".prisma/client").$Enums.OnboardingStatus;
        onboardingSteps: import("@prisma/client/runtime/library.js").JsonValue;
    }>;
    getPartner(id: string): Promise<({
        capabilities: {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            isActive: boolean;
            lastUpdated: Date;
            details: import("@prisma/client/runtime/library.js").JsonValue;
            category: string;
            sourceType: import(".prisma/client").$Enums.CapabilitySourceType;
            sourceData: import("@prisma/client/runtime/library.js").JsonValue | null;
        }[];
        creativeSpecs: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            requirements: import("@prisma/client/runtime/library.js").JsonValue;
            isActive: boolean;
            format: string;
            dimensions: import("@prisma/client/runtime/library.js").JsonValue;
            fileType: string;
            maxFileSize: number;
            examples: import("@prisma/client/runtime/library.js").JsonValue | null;
        }[];
        healthMetrics: {
            timestamp: Date;
            uptime: number | null;
            id: string;
            partnerId: string;
            apiStatus: import(".prisma/client").$Enums.ApiStatus;
            responseTime: number | null;
            errorRate: number | null;
            lastError: string | null;
            healthScore: number | null;
            details: import("@prisma/client/runtime/library.js").JsonValue | null;
        }[];
        campaignAssociations: ({
            campaign: {
                status: string;
                name: string;
                id: string;
            };
        } & {
            status: import(".prisma/client").$Enums.CampaignPartnerStatus;
            id: string;
            budget: import("@prisma/client/runtime/library.js").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
            campaignId: string;
            partnerId: string;
            targeting: import("@prisma/client/runtime/library.js").JsonValue | null;
            creative: import("@prisma/client/runtime/library.js").JsonValue | null;
        })[];
    } & {
        type: import(".prisma/client").$Enums.PartnerType;
        status: import(".prisma/client").$Enums.PartnerStatus;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayName: string;
        companyInfo: import("@prisma/client/runtime/library.js").JsonValue;
        contactInfo: import("@prisma/client/runtime/library.js").JsonValue;
        apiCredentials: import("@prisma/client/runtime/library.js").JsonValue | null;
        targetingOptions: import("@prisma/client/runtime/library.js").JsonValue;
        measurementCapabilities: import("@prisma/client/runtime/library.js").JsonValue;
        pricingInfo: import("@prisma/client/runtime/library.js").JsonValue;
        onboardingStatus: import(".prisma/client").$Enums.OnboardingStatus;
        onboardingSteps: import("@prisma/client/runtime/library.js").JsonValue;
    }) | null>;
    updatePartner(id: string, data: UpdatePartnerRequest, userId: string): Promise<{
        capabilities: {
            name: string;
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            isActive: boolean;
            lastUpdated: Date;
            details: import("@prisma/client/runtime/library.js").JsonValue;
            category: string;
            sourceType: import(".prisma/client").$Enums.CapabilitySourceType;
            sourceData: import("@prisma/client/runtime/library.js").JsonValue | null;
        }[];
        creativeSpecs: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            partnerId: string;
            requirements: import("@prisma/client/runtime/library.js").JsonValue;
            isActive: boolean;
            format: string;
            dimensions: import("@prisma/client/runtime/library.js").JsonValue;
            fileType: string;
            maxFileSize: number;
            examples: import("@prisma/client/runtime/library.js").JsonValue | null;
        }[];
        healthMetrics: {
            timestamp: Date;
            uptime: number | null;
            id: string;
            partnerId: string;
            apiStatus: import(".prisma/client").$Enums.ApiStatus;
            responseTime: number | null;
            errorRate: number | null;
            lastError: string | null;
            healthScore: number | null;
            details: import("@prisma/client/runtime/library.js").JsonValue | null;
        }[];
    } & {
        type: import(".prisma/client").$Enums.PartnerType;
        status: import(".prisma/client").$Enums.PartnerStatus;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayName: string;
        companyInfo: import("@prisma/client/runtime/library.js").JsonValue;
        contactInfo: import("@prisma/client/runtime/library.js").JsonValue;
        apiCredentials: import("@prisma/client/runtime/library.js").JsonValue | null;
        targetingOptions: import("@prisma/client/runtime/library.js").JsonValue;
        measurementCapabilities: import("@prisma/client/runtime/library.js").JsonValue;
        pricingInfo: import("@prisma/client/runtime/library.js").JsonValue;
        onboardingStatus: import(".prisma/client").$Enums.OnboardingStatus;
        onboardingSteps: import("@prisma/client/runtime/library.js").JsonValue;
    }>;
    searchPartners(params: PartnerSearchRequest): Promise<{
        partners: ({
            _count: {
                campaignAssociations: number;
            };
            capabilities: {
                name: string;
                category: string;
            }[];
            healthMetrics: {
                timestamp: Date;
                uptime: number | null;
                id: string;
                partnerId: string;
                apiStatus: import(".prisma/client").$Enums.ApiStatus;
                responseTime: number | null;
                errorRate: number | null;
                lastError: string | null;
                healthScore: number | null;
                details: import("@prisma/client/runtime/library.js").JsonValue | null;
            }[];
        } & {
            type: import(".prisma/client").$Enums.PartnerType;
            status: import(".prisma/client").$Enums.PartnerStatus;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            displayName: string;
            companyInfo: import("@prisma/client/runtime/library.js").JsonValue;
            contactInfo: import("@prisma/client/runtime/library.js").JsonValue;
            apiCredentials: import("@prisma/client/runtime/library.js").JsonValue | null;
            targetingOptions: import("@prisma/client/runtime/library.js").JsonValue;
            measurementCapabilities: import("@prisma/client/runtime/library.js").JsonValue;
            pricingInfo: import("@prisma/client/runtime/library.js").JsonValue;
            onboardingStatus: import(".prisma/client").$Enums.OnboardingStatus;
            onboardingSteps: import("@prisma/client/runtime/library.js").JsonValue;
        })[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
        };
    }>;
    bulkOperation(operation: BulkPartnerOperation, userId: string): Promise<{
        success: boolean;
        affectedCount: number;
    }>;
    updatePartnerStatus(id: string, status: PartnerStatus, userId: string): Promise<{
        status: import(".prisma/client").$Enums.PartnerStatus;
        name: string;
    }>;
    updateOnboardingStatus(id: string, status: OnboardingStatus, step?: string, userId?: string): Promise<{
        name: string;
        onboardingStatus: import(".prisma/client").$Enums.OnboardingStatus;
    }>;
    recordHealthMetric(partnerId: string, metric: PartnerHealthMetric): Promise<{
        timestamp: Date;
        uptime: number | null;
        id: string;
        partnerId: string;
        apiStatus: import(".prisma/client").$Enums.ApiStatus;
        responseTime: number | null;
        errorRate: number | null;
        lastError: string | null;
        healthScore: number | null;
        details: import("@prisma/client/runtime/library.js").JsonValue | null;
    }>;
    getPartnerHealth(partnerId: string, days?: number): Promise<{
        timestamp: Date;
        uptime: number | null;
        id: string;
        partnerId: string;
        apiStatus: import(".prisma/client").$Enums.ApiStatus;
        responseTime: number | null;
        errorRate: number | null;
        lastError: string | null;
        healthScore: number | null;
        details: import("@prisma/client/runtime/library.js").JsonValue | null;
    }[]>;
    addCapability(partnerId: string, capability: PartnerCapability, userId: string): Promise<{
        name: string;
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        isActive: boolean;
        lastUpdated: Date;
        details: import("@prisma/client/runtime/library.js").JsonValue;
        category: string;
        sourceType: import(".prisma/client").$Enums.CapabilitySourceType;
        sourceData: import("@prisma/client/runtime/library.js").JsonValue | null;
    }>;
    addCreativeSpec(partnerId: string, spec: CreativeSpec, userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        partnerId: string;
        requirements: import("@prisma/client/runtime/library.js").JsonValue;
        isActive: boolean;
        format: string;
        dimensions: import("@prisma/client/runtime/library.js").JsonValue;
        fileType: string;
        maxFileSize: number;
        examples: import("@prisma/client/runtime/library.js").JsonValue | null;
    }>;
    associateWithCampaign(association: CampaignPartnerAssociation, userId: string): Promise<{
        campaign: {
            name: string;
        };
        partner: {
            name: string;
        };
    } & {
        status: import(".prisma/client").$Enums.CampaignPartnerStatus;
        id: string;
        budget: import("@prisma/client/runtime/library.js").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        partnerId: string;
        targeting: import("@prisma/client/runtime/library.js").JsonValue | null;
        creative: import("@prisma/client/runtime/library.js").JsonValue | null;
    }>;
    getCampaignPartners(campaignId: string): Promise<({
        partner: {
            capabilities: {
                name: string;
                category: string;
            }[];
            healthMetrics: {
                timestamp: Date;
                uptime: number | null;
                id: string;
                partnerId: string;
                apiStatus: import(".prisma/client").$Enums.ApiStatus;
                responseTime: number | null;
                errorRate: number | null;
                lastError: string | null;
                healthScore: number | null;
                details: import("@prisma/client/runtime/library.js").JsonValue | null;
            }[];
        } & {
            type: import(".prisma/client").$Enums.PartnerType;
            status: import(".prisma/client").$Enums.PartnerStatus;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            displayName: string;
            companyInfo: import("@prisma/client/runtime/library.js").JsonValue;
            contactInfo: import("@prisma/client/runtime/library.js").JsonValue;
            apiCredentials: import("@prisma/client/runtime/library.js").JsonValue | null;
            targetingOptions: import("@prisma/client/runtime/library.js").JsonValue;
            measurementCapabilities: import("@prisma/client/runtime/library.js").JsonValue;
            pricingInfo: import("@prisma/client/runtime/library.js").JsonValue;
            onboardingStatus: import(".prisma/client").$Enums.OnboardingStatus;
            onboardingSteps: import("@prisma/client/runtime/library.js").JsonValue;
        };
    } & {
        status: import(".prisma/client").$Enums.CampaignPartnerStatus;
        id: string;
        budget: import("@prisma/client/runtime/library.js").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
        campaignId: string;
        partnerId: string;
        targeting: import("@prisma/client/runtime/library.js").JsonValue | null;
        creative: import("@prisma/client/runtime/library.js").JsonValue | null;
    })[]>;
    generateCapabilityComparison(partnerIds: string[], categories?: string[]): Promise<any>;
    private generateDefaultOnboardingSteps;
    private logAuditEvent;
}
//# sourceMappingURL=partnerService.d.ts.map