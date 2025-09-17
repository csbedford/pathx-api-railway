import { PrismaClient } from '@prisma/client';
import type { PartnerHealthMetric } from '../types/partner.js';
export declare class PartnerHealthService {
    private prisma;
    constructor(prisma: PrismaClient);
    monitorPartnerHealth(partnerId: string): Promise<PartnerHealthMetric>;
    batchMonitorHealth(partnerIds?: string[]): Promise<PartnerHealthMetric[]>;
    getHealthSummary(partnerId: string, days?: number): Promise<{
        partnerId: string;
        period: {
            days: number;
            since: string;
        };
        totalChecks: number;
        uptime: number;
        averageResponseTime: number;
        averageHealthScore: number;
        currentStatus: import(".prisma/client").$Enums.ApiStatus;
        lastCheck: Date;
        recentErrors: {
            timestamp: Date;
            error: string | null;
            apiStatus: import(".prisma/client").$Enums.ApiStatus;
        }[];
        trends: {
            trend: string;
            change: number;
        };
    }>;
    getAllPartnersHealthSummary(): Promise<{
        id: string;
        name: string;
        type: import(".prisma/client").$Enums.PartnerType;
        status: import(".prisma/client").$Enums.PartnerStatus;
        lastHealthCheck: {
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
        };
        healthStatus: "unknown" | "healthy" | "degraded" | "down";
    }[]>;
    scheduleHealthChecks(intervalMinutes?: number): Promise<void>;
    private testApiEndpoint;
    private calculateHealthScore;
    private calculateUptime;
    private calculateTrends;
    private determineHealthStatus;
}
//# sourceMappingURL=partnerHealthService.d.ts.map