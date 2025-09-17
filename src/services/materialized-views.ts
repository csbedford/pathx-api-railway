import { PrismaClient } from '@prisma/client';
import { cacheService } from '../lib/redis';
import { jobQueue } from '../lib/queue';

interface MaterializedView {
  name: string;
  refreshIntervalMs: number;
  dependencies: string[]; // Tables this view depends on
  priority: number; // 1-10, higher = more important
}

export class MaterializedViewService {
  private prisma: PrismaClient;
  private views: MaterializedView[] = [
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

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.scheduleRefreshes();
  }

  // Queue immediate refresh for high-priority views
  async refreshCriticalViews(): Promise<void> {
    const criticalViews = this.views.filter(v => v.priority >= 8);
    
    for (const view of criticalViews) {
      await jobQueue.queueViewRefresh({
        viewName: view.name
      });
    }
  }

  // Refresh specific view
  async refreshView(viewName: string): Promise<{ success: boolean; duration: number; error?: string }> {
    const startTime = Date.now();
    const cacheKey = `view_refresh:${viewName}`;
    
    try {
      // Check if refresh is already in progress
      const inProgress = await cacheService.get(cacheKey);
      if (inProgress) {
        return { success: false, duration: 0, error: 'Refresh already in progress' };
      }

      // Mark as in progress
      await cacheService.set(cacheKey, { status: 'refreshing', startTime }, 300);

      // Perform the refresh
      await this.prisma.$executeRawUnsafe(`REFRESH MATERIALIZED VIEW CONCURRENTLY ${viewName}`);
      
      const duration = Date.now() - startTime;
      
      // Clear in-progress flag
      await cacheService.del(cacheKey);
      
      // Cache successful refresh time
      await cacheService.set(`view_last_refresh:${viewName}`, {
        timestamp: new Date(),
        duration
      }, 24 * 60 * 60); // 24 hours

      return { success: true, duration };
    } catch (error) {
      await cacheService.del(cacheKey);
      console.error(`Failed to refresh materialized view ${viewName}:`, error);
      return { 
        success: false, 
        duration: Date.now() - startTime,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Intelligent refresh based on data changes
  async refreshViewsForTable(tableName: string): Promise<void> {
    const affectedViews = this.views.filter(v => 
      v.dependencies.includes(tableName)
    ).sort((a, b) => b.priority - a.priority); // Higher priority first

    for (const view of affectedViews) {
      const lastRefresh = await this.getLastRefreshTime(view.name);
      const timeSinceRefresh = lastRefresh ? Date.now() - lastRefresh.getTime() : Infinity;
      
      // Only refresh if enough time has passed or if it's critical
      if (timeSinceRefresh > view.refreshIntervalMs / 4 || view.priority >= 9) {
        await jobQueue.queueViewRefresh({
          viewName: view.name
        });
      }
    }
  }

  // Get view statistics for monitoring
  async getViewStats(): Promise<Array<{
    name: string;
    lastRefresh: Date | null;
    refreshDuration: number | null;
    priority: number;
    status: 'healthy' | 'stale' | 'error';
  }>> {
    const stats = [];
    
    for (const view of this.views) {
      const lastRefreshData = await cacheService.get(`view_last_refresh:${view.name}`);
      const lastRefresh = lastRefreshData?.timestamp ? new Date(lastRefreshData.timestamp) : null;
      const refreshDuration = lastRefreshData?.duration || null;
      
      let status: 'healthy' | 'stale' | 'error' = 'healthy';
      if (lastRefresh) {
        const timeSinceRefresh = Date.now() - lastRefresh.getTime();
        if (timeSinceRefresh > view.refreshIntervalMs * 2) {
          status = 'stale';
        }
      } else {
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
  async getCampaignSummary(campaignId: string): Promise<any> {
    const cacheKey = `campaign_summary:${campaignId}`;
    
    return cacheService.getOrSet(cacheKey, async () => {
      const result = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM distribution_campaign_summary 
        WHERE campaign_id = $1
      `, campaignId);
      
      return Array.isArray(result) ? result[0] : null;
    }, 60); // 1 minute cache
  }

  async getScenarioPerformance(sessionId: string): Promise<any[]> {
    const cacheKey = `scenario_performance:${sessionId}`;
    
    return cacheService.getOrSet(cacheKey, async () => {
      return this.prisma.$queryRawUnsafe(`
        SELECT * FROM distribution_scenario_performance 
        WHERE session_id = $1
        ORDER BY roi DESC
      `, sessionId);
    }, 30); // 30 second cache
  }

  async getUserActivity(userId: string): Promise<any> {
    const cacheKey = `user_activity:${userId}`;
    
    return cacheService.getOrSet(cacheKey, async () => {
      const result = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM distribution_user_activity 
        WHERE user_id = $1
      `, userId);
      
      return Array.isArray(result) ? result[0] : null;
    }, 300); // 5 minute cache
  }

  async getChangePatterns(field?: string): Promise<any[]> {
    const cacheKey = field ? `change_patterns:${field}` : 'change_patterns:all';
    
    return cacheService.getOrSet(cacheKey, async () => {
      const query = field 
        ? `SELECT * FROM distribution_change_patterns WHERE field = $1 ORDER BY change_frequency DESC`
        : `SELECT * FROM distribution_change_patterns ORDER BY change_frequency DESC LIMIT 20`;
      
      return field 
        ? this.prisma.$queryRawUnsafe(query, field)
        : this.prisma.$queryRawUnsafe(query);
    }, 1800); // 30 minute cache
  }

  async getPerformanceMetrics(): Promise<any> {
    const cacheKey = 'performance_metrics';
    
    return cacheService.getOrSet(cacheKey, async () => {
      const result = await this.prisma.$queryRawUnsafe(`
        SELECT * FROM distribution_performance_metrics
      `);
      
      return Array.isArray(result) ? result[0] : null;
    }, 30); // 30 second cache
  }

  private async getLastRefreshTime(viewName: string): Promise<Date | null> {
    const data = await cacheService.get(`view_last_refresh:${viewName}`);
    return data?.timestamp ? new Date(data.timestamp) : null;
  }

  private scheduleRefreshes(): void {
    // Schedule regular refreshes for each view
    this.views.forEach(view => {
      setInterval(async () => {
        await jobQueue.queueViewRefresh({
          viewName: view.name
        });
      }, view.refreshIntervalMs);
    });

    console.log(`Scheduled materialized view refreshes for ${this.views.length} views`);
  }

  // Force refresh all views (for initial setup or emergency)
  async refreshAllViews(): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const view of this.views.sort((a, b) => b.priority - a.priority)) {
      try {
        const result = await this.refreshView(view.name);
        if (result.success) {
          success++;
        } else {
          failed++;
          if (result.error) errors.push(`${view.name}: ${result.error}`);
        }
      } catch (error) {
        failed++;
        errors.push(`${view.name}: ${error}`);
      }
    }

    return { success, failed, errors };
  }
}

// Singleton instance
let materializedViewService: MaterializedViewService;

export function getMaterializedViewService(prisma: PrismaClient): MaterializedViewService {
  if (!materializedViewService) {
    materializedViewService = new MaterializedViewService(prisma);
  }
  return materializedViewService;
}