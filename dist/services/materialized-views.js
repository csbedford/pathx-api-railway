"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MaterializedViewService = void 0;
exports.getMaterializedViewService = getMaterializedViewService;
const redis_1 = require("../lib/redis");
const queue_1 = require("../lib/queue");
class MaterializedViewService {
    prisma;
    views = [
        {
            name: 'distribution_campaign_summary',
            refreshIntervalMs: 5 * 60 * 1000, // 5 minutes
            dependencies: ['Campaign', 'DistributionSession', 'DistributionScenario', 'DistributionChange'],
            priority: 8
        },
        {
            name: 'distribution_scenario_performance',
            refreshIntervalMs: 2 * 60 * 1000, // 2 minutes
            dependencies: ['DistributionScenario'],
            priority: 10
        },
        {
            name: 'distribution_user_activity',
            refreshIntervalMs: 15 * 60 * 1000, // 15 minutes
            dependencies: ['User', 'DistributionChange'],
            priority: 5
        },
        {
            name: 'distribution_change_patterns',
            refreshIntervalMs: 60 * 60 * 1000, // 1 hour
            dependencies: ['DistributionChange'],
            priority: 3
        },
        {
            name: 'distribution_performance_metrics',
            refreshIntervalMs: 1 * 60 * 1000, // 1 minute
            dependencies: ['DistributionSession', 'DistributionScenario', 'DistributionChange'],
            priority: 9
        }
    ];
    constructor(prisma) {
        this.prisma = prisma;
        this.scheduleRefreshes();
    }
    // Queue immediate refresh for high-priority views
    async refreshCriticalViews() {
        const criticalViews = this.views.filter(v => v.priority >= 8);
        for (const view of criticalViews) {
            await queue_1.jobQueue.queueViewRefresh({
                viewName: view.name
            });
        }
    }
    // Refresh specific view
    async refreshView(viewName) {
        const startTime = Date.now();
        const cacheKey = `view_refresh:${viewName}`;
        try {
            // Check if refresh is already in progress
            const inProgress = await redis_1.cacheService.get(cacheKey);
            if (inProgress) {
                return { success: false, duration: 0, error: 'Refresh already in progress' };
            }
            // Mark as in progress
            await redis_1.cacheService.set(cacheKey, { status: 'refreshing', startTime }, 300);
            // Perform the refresh
            await this.prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName}`);
            const duration = Date.now() - startTime;
            // Clear in-progress flag
            await redis_1.cacheService.del(cacheKey);
            // Cache successful refresh time
            await redis_1.cacheService.set(`view_last_refresh:${viewName}`, {
                timestamp: new Date(),
                duration
            }, 24 * 60 * 60); // 24 hours
            return { success: true, duration };
        }
        catch (error) {
            await redis_1.cacheService.del(cacheKey);
            console.error(`Failed to refresh materialized view ${viewName}:`, error);
            return {
                success: false,
                duration: Date.now() - startTime,
                error: error instanceof Error ? error.message : 'Unknown error'
            };
        }
    }
    // Intelligent refresh based on data changes
    async refreshViewsForTable(tableName) {
        const affectedViews = this.views.filter(v => v.dependencies.includes(tableName)).sort((a, b) => b.priority - a.priority); // Higher priority first
        for (const view of affectedViews) {
            const lastRefresh = await this.getLastRefreshTime(view.name);
            const timeSinceRefresh = lastRefresh ? Date.now() - lastRefresh.getTime() : Infinity;
            // Only refresh if enough time has passed or if it's critical
            if (timeSinceRefresh > view.refreshIntervalMs / 4 || view.priority >= 9) {
                await queue_1.jobQueue.queueViewRefresh({
                    viewName: view.name
                });
            }
        }
    }
    // Get view statistics for monitoring
    async getViewStats() {
        const stats = [];
        for (const view of this.views) {
            const lastRefreshData = await redis_1.cacheService.get(`view_last_refresh:${view.name}`);
            const lastRefresh = lastRefreshData?.timestamp ? new Date(lastRefreshData.timestamp) : null;
            const refreshDuration = lastRefreshData?.duration || null;
            let status = 'healthy';
            if (lastRefresh) {
                const timeSinceRefresh = Date.now() - lastRefresh.getTime();
                if (timeSinceRefresh > view.refreshIntervalMs * 2) {
                    status = 'stale';
                }
            }
            else {
                status = 'error';
            }
            stats.push({
                name: view.name,
                lastRefresh,
                refreshDuration,
                priority: view.priority,
                status
            });
        }
        return stats;
    }
    // Fast queries using materialized views
    async getCampaignSummary(campaignId) {
        const cacheKey = `campaign_summary:${campaignId}`;
        return redis_1.cacheService.getOrSet(cacheKey, async () => {
            const result = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM distribution_campaign_summary 
        WHERE campaign_id = $1
      `, campaignId);
            return Array.isArray(result) ? result[0] : null;
        }, 60); // 1 minute cache
    }
    async getScenarioPerformance(sessionId) {
        const cacheKey = `scenario_performance:${sessionId}`;
        return redis_1.cacheService.getOrSet(cacheKey, async () => {
            return this.prisma.$queryRawUnsafe(`
        SELECT * FROM distribution_scenario_performance 
        WHERE session_id = $1
        ORDER BY roi DESC
      `, sessionId);
        }, 30); // 30 second cache
    }
    async getUserActivity(userId) {
        const cacheKey = `user_activity:${userId}`;
        return redis_1.cacheService.getOrSet(cacheKey, async () => {
            const result = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM distribution_user_activity 
        WHERE user_id = $1
      `, userId);
            return Array.isArray(result) ? result[0] : null;
        }, 300); // 5 minute cache
    }
    async getChangePatterns(field) {
        const cacheKey = field ? `change_patterns:${field}` : 'change_patterns:all';
        return redis_1.cacheService.getOrSet(cacheKey, async () => {
            const query = field
                ? `SELECT * FROM distribution_change_patterns WHERE field = $1 ORDER BY change_frequency DESC`
                : `SELECT * FROM distribution_change_patterns ORDER BY change_frequency DESC LIMIT 20`;
            return field
                ? this.prisma.$queryRawUnsafe(query, field)
                : this.prisma.$queryRawUnsafe(query);
        }, 1800); // 30 minute cache
    }
    async getPerformanceMetrics() {
        const cacheKey = 'performance_metrics';
        return redis_1.cacheService.getOrSet(cacheKey, async () => {
            const result = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM distribution_performance_metrics
      `);
            return Array.isArray(result) ? result[0] : null;
        }, 30); // 30 second cache
    }
    async getLastRefreshTime(viewName) {
        const data = await redis_1.cacheService.get(`view_last_refresh:${viewName}`);
        return data?.timestamp ? new Date(data.timestamp) : null;
    }
    scheduleRefreshes() {
        // Schedule regular refreshes for each view
        this.views.forEach(view => {
            setInterval(async () => {
                await queue_1.jobQueue.queueViewRefresh({
                    viewName: view.name
                });
            }, view.refreshIntervalMs);
        });
        console.log(`Scheduled materialized view refreshes for ${this.views.length} views`);
    }
    // Force refresh all views (for initial setup or emergency)
    async refreshAllViews() {
        let success = 0;
        let failed = 0;
        const errors = [];
        for (const view of this.views.sort((a, b) => b.priority - a.priority)) {
            try {
                const result = await this.refreshView(view.name);
                if (result.success) {
                    success++;
                }
                else {
                    failed++;
                    if (result.error)
                        errors.push(`${view.name}: ${result.error}`);
                }
            }
            catch (error) {
                failed++;
                errors.push(`${view.name}: ${error}`);
            }
        }
        return { success, failed, errors };
    }
}
exports.MaterializedViewService = MaterializedViewService;
// Singleton instance
let materializedViewService;
function getMaterializedViewService(prisma) {
    if (!materializedViewService) {
        materializedViewService = new MaterializedViewService(prisma);
    }
    return materializedViewService;
}
//# sourceMappingURL=materialized-views.js.map