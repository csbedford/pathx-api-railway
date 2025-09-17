import { PrismaClient } from '@prisma/client';
export declare class MaterializedViewService {
    private prisma;
    private views;
    constructor(prisma: PrismaClient);
    refreshCriticalViews(): Promise<void>;
    refreshView(viewName: string): Promise<{
        success: boolean;
        duration: number;
        error?: string;
    }>;
    refreshViewsForTable(tableName: string): Promise<void>;
    getViewStats(): Promise<Array<{
        name: string;
        lastRefresh: Date | null;
        refreshDuration: number | null;
        priority: number;
        status: 'healthy' | 'stale' | 'error';
    }>>;
    getCampaignSummary(campaignId: string): Promise<any>;
    getScenarioPerformance(sessionId: string): Promise<any[]>;
    getUserActivity(userId: string): Promise<any>;
    getChangePatterns(field?: string): Promise<any[]>;
    getPerformanceMetrics(): Promise<any>;
    private getLastRefreshTime;
    private scheduleRefreshes;
    refreshAllViews(): Promise<{
        success: number;
        failed: number;
        errors: string[];
    }>;
}
export declare function getMaterializedViewService(prisma: PrismaClient): MaterializedViewService;
//# sourceMappingURL=materialized-views.d.ts.map