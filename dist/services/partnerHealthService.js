"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PartnerHealthService = void 0;
class PartnerHealthService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async monitorPartnerHealth(partnerId) {
        const partner = await this.prisma.partner.findUnique({
            where: { id: partnerId },
            select: {
                id: true,
                name: true,
                apiCredentials: true,
                status: true
            }
        });
        if (!partner) {
            throw new Error('Partner not found');
        }
        const startTime = Date.now();
        let apiStatus = 'UNKNOWN';
        let responseTime;
        let lastError;
        let healthScore = 0;
        try {
            if (partner.apiCredentials && partner.apiCredentials?.endpoints?.base) {
                const apiCreds = partner.apiCredentials;
                const baseUrl = apiCreds.endpoints.base;
                const response = await this.testApiEndpoint(baseUrl, apiCreds);
                responseTime = Date.now() - startTime;
                if (response.ok) {
                    apiStatus = responseTime < 1000 ? 'HEALTHY' : 'DEGRADED';
                    healthScore = this.calculateHealthScore(responseTime, 0, 100);
                }
                else {
                    apiStatus = 'DOWN';
                    lastError = `HTTP ${response.status}: ${response.statusText}`;
                    healthScore = 0;
                }
            }
            else {
                apiStatus = 'UNKNOWN';
                lastError = 'No API credentials configured';
                healthScore = 50; // Partial score for unconfigured but not failed
            }
        }
        catch (error) {
            responseTime = Date.now() - startTime;
            apiStatus = 'DOWN';
            lastError = error instanceof Error ? error.message : 'Unknown error';
            healthScore = 0;
        }
        const healthMetric = {
            timestamp: new Date().toISOString(),
            apiStatus,
            responseTime,
            errorRate: apiStatus === 'DOWN' ? 100 : 0,
            uptime: await this.calculateUptime(partnerId),
            lastError,
            healthScore,
            details: {
                partnerId,
                partnerName: partner.name,
                partnerStatus: partner.status,
                testType: 'api_ping',
                timestamp: new Date().toISOString()
            }
        };
        // Record the health metric
        await this.prisma.partnerHealthMetric.create({
            data: {
                partnerId,
                timestamp: new Date(healthMetric.timestamp),
                apiStatus: healthMetric.apiStatus,
                responseTime: healthMetric.responseTime,
                errorRate: healthMetric.errorRate,
                uptime: healthMetric.uptime,
                lastError: healthMetric.lastError,
                healthScore: healthMetric.healthScore,
                details: healthMetric.details
            }
        });
        return healthMetric;
    }
    async batchMonitorHealth(partnerIds) {
        const partners = await this.prisma.partner.findMany({
            where: partnerIds ? { id: { in: partnerIds } } : { status: 'ACTIVE' },
            select: { id: true }
        });
        const healthChecks = partners.map(partner => this.monitorPartnerHealth(partner.id).catch(error => ({
            timestamp: new Date().toISOString(),
            apiStatus: 'DOWN',
            errorRate: 100,
            uptime: 0,
            lastError: error.message,
            healthScore: 0,
            details: { partnerId: partner.id, error: error.message }
        })));
        return Promise.all(healthChecks);
    }
    async getHealthSummary(partnerId, days = 7) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const metrics = await this.prisma.partnerHealthMetric.findMany({
            where: {
                partnerId,
                timestamp: { gte: since }
            },
            orderBy: { timestamp: 'desc' }
        });
        const totalChecks = metrics.length;
        const healthyChecks = metrics.filter(m => m.apiStatus === 'HEALTHY').length;
        const averageResponseTime = metrics
            .filter(m => m.responseTime)
            .reduce((sum, m) => sum + (m.responseTime || 0), 0) / totalChecks || 0;
        const averageHealthScore = metrics
            .reduce((sum, m) => sum + (m.healthScore || 0), 0) / totalChecks || 0;
        const uptime = totalChecks > 0 ? (healthyChecks / totalChecks) * 100 : 0;
        const recentErrors = metrics
            .filter(m => m.lastError)
            .slice(0, 5)
            .map(m => ({
            timestamp: m.timestamp,
            error: m.lastError,
            apiStatus: m.apiStatus
        }));
        return {
            partnerId,
            period: { days, since: since.toISOString() },
            totalChecks,
            uptime: Number(uptime.toFixed(2)),
            averageResponseTime: Number(averageResponseTime.toFixed(2)),
            averageHealthScore: Number(averageHealthScore.toFixed(2)),
            currentStatus: metrics[0]?.apiStatus || 'UNKNOWN',
            lastCheck: metrics[0]?.timestamp || null,
            recentErrors,
            trends: this.calculateTrends(metrics)
        };
    }
    async getAllPartnersHealthSummary() {
        const partners = await this.prisma.partner.findMany({
            where: { status: { in: ['ACTIVE', 'PENDING'] } },
            select: {
                id: true,
                name: true,
                type: true,
                status: true,
                healthMetrics: {
                    orderBy: { timestamp: 'desc' },
                    take: 1
                }
            }
        });
        return partners.map(partner => ({
            id: partner.id,
            name: partner.name,
            type: partner.type,
            status: partner.status,
            lastHealthCheck: partner.healthMetrics[0] || null,
            healthStatus: this.determineHealthStatus(partner.healthMetrics[0])
        }));
    }
    async scheduleHealthChecks(intervalMinutes = 15) {
        const interval = intervalMinutes * 60 * 1000;
        setInterval(async () => {
            try {
                console.log('Running scheduled health checks...');
                const results = await this.batchMonitorHealth();
                const failedChecks = results.filter(r => r.apiStatus === 'DOWN');
                if (failedChecks.length > 0) {
                    console.warn(`Health check failures detected for ${failedChecks.length} partners`);
                    // Here you could trigger alerts, notifications, etc.
                }
                console.log(`Health checks completed: ${results.length} partners checked`);
            }
            catch (error) {
                console.error('Scheduled health check failed:', error);
            }
        }, interval);
        console.log(`Partner health monitoring scheduled every ${intervalMinutes} minutes`);
    }
    async testApiEndpoint(baseUrl, credentials) {
        const testEndpoint = `${baseUrl.replace(/\/$/, '')}/health`;
        const headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'PathX-HealthMonitor/1.0'
        };
        // Add authentication based on credential type
        if (credentials.type === 'API_KEY' && credentials.credentials?.apiKey) {
            headers['Authorization'] = `Bearer ${credentials.credentials.apiKey}`;
        }
        else if (credentials.type === 'BASIC_AUTH') {
            const auth = btoa(`${credentials.credentials?.username}:${credentials.credentials?.password}`);
            headers['Authorization'] = `Basic ${auth}`;
        }
        return fetch(testEndpoint, {
            method: 'GET',
            headers,
            signal: AbortSignal.timeout(10000) // 10 second timeout
        });
    }
    calculateHealthScore(responseTime, errorRate, uptime) {
        // Weight factors
        const responseWeight = 0.4;
        const errorWeight = 0.3;
        const uptimeWeight = 0.3;
        // Response time score (0-100, where < 500ms = 100, > 5000ms = 0)
        const responseScore = Math.max(0, Math.min(100, 100 - (responseTime - 500) / 45));
        // Error rate score (0-100, where 0% errors = 100, 100% errors = 0)
        const errorScore = Math.max(0, 100 - errorRate);
        // Uptime score is already 0-100
        const uptimeScore = uptime;
        const totalScore = (responseScore * responseWeight +
            errorScore * errorWeight +
            uptimeScore * uptimeWeight);
        return Math.round(Math.max(0, Math.min(100, totalScore)));
    }
    async calculateUptime(partnerId, days = 1) {
        const since = new Date();
        since.setDate(since.getDate() - days);
        const metrics = await this.prisma.partnerHealthMetric.findMany({
            where: {
                partnerId,
                timestamp: { gte: since }
            },
            select: { apiStatus: true }
        });
        if (metrics.length === 0)
            return 0;
        const healthyCount = metrics.filter(m => m.apiStatus === 'HEALTHY').length;
        return (healthyCount / metrics.length) * 100;
    }
    calculateTrends(metrics) {
        if (metrics.length < 2)
            return { trend: 'stable', change: 0 };
        const recent = metrics.slice(0, Math.floor(metrics.length / 2));
        const older = metrics.slice(Math.floor(metrics.length / 2));
        const recentAvg = recent.reduce((sum, m) => sum + (m.healthScore || 0), 0) / recent.length;
        const olderAvg = older.reduce((sum, m) => sum + (m.healthScore || 0), 0) / older.length;
        const change = recentAvg - olderAvg;
        const trend = change > 5 ? 'improving' : change < -5 ? 'degrading' : 'stable';
        return { trend, change: Number(change.toFixed(2)) };
    }
    determineHealthStatus(lastMetric) {
        if (!lastMetric)
            return 'unknown';
        switch (lastMetric.apiStatus) {
            case 'HEALTHY': return 'healthy';
            case 'DEGRADED': return 'degraded';
            case 'DOWN': return 'down';
            default: return 'unknown';
        }
    }
}
exports.PartnerHealthService = PartnerHealthService;
//# sourceMappingURL=partnerHealthService.js.map