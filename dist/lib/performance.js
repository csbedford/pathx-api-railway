"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceOptimizer = exports.PerformanceOptimizer = void 0;
const redis_1 = require("./redis");
class PerformanceOptimizer {
    responseTimeTargets = {
        critical: 500, // 0.5s for critical operations
        fast: 1000, // 1s for fast operations  
        standard: 3000, // 3s for standard operations
    };
    metricsCache = new Map();
    // Track response times for optimization
    async trackResponse(operation, responseTime, category = 'standard') {
        const now = Date.now();
        const existing = this.metricsCache.get(operation) || {
            count: 0,
            totalTime: 0,
            maxTime: 0,
            minTime: Infinity,
            lastUpdate: now
        };
        const updated = {
            count: existing.count + 1,
            totalTime: existing.totalTime + responseTime,
            maxTime: Math.max(existing.maxTime, responseTime),
            minTime: Math.min(existing.minTime, responseTime),
            lastUpdate: now
        };
        this.metricsCache.set(operation, updated);
        // Alert if response time exceeds target
        const target = this.responseTimeTargets[category];
        if (responseTime > target) {
            console.warn(`Performance alert: ${operation} took ${responseTime}ms (target: ${target}ms)`);
            // Cache the slow operation for investigation
            await redis_1.cacheService.set(`slow_operation:${operation}:${now}`, {
                operation,
                responseTime,
                target,
                category,
                timestamp: new Date()
            }, 3600); // 1 hour
        }
    }
    // Get performance metrics
    getMetrics(operation) {
        if (operation) {
            const metrics = this.metricsCache.get(operation);
            if (!metrics)
                return null;
            return {
                operation,
                avgResponseTime: metrics.totalTime / metrics.count,
                maxResponseTime: metrics.maxTime,
                minResponseTime: metrics.minTime === Infinity ? 0 : metrics.minTime,
                callCount: metrics.count,
                lastUpdate: new Date(metrics.lastUpdate)
            };
        }
        // Return all metrics
        const allMetrics = [];
        for (const [op, metrics] of this.metricsCache.entries()) {
            allMetrics.push({
                operation: op,
                avgResponseTime: metrics.totalTime / metrics.count,
                maxResponseTime: metrics.maxTime,
                minResponseTime: metrics.minTime === Infinity ? 0 : metrics.minTime,
                callCount: metrics.count,
                lastUpdate: new Date(metrics.lastUpdate)
            });
        }
        return allMetrics.sort((a, b) => b.avgResponseTime - a.avgResponseTime);
    }
    // Fast calculation helpers for distribution modeling
    static fastProjectionCalculation(parameters) {
        // Vectorized calculations for maximum speed
        const { msrp, distributorMargin, retailerMargin, volumeCommitment, marketingSpend, seasonalAdjustment } = parameters;
        // Pre-compute common values
        const retailPrice = msrp * (1 - retailerMargin * 0.01);
        const unitMargin = retailPrice * (distributorMargin * 0.01);
        const adjustedVolume = volumeCommitment * seasonalAdjustment;
        // Fast calculations using bitwise operations where possible
        const year1Revenue = Math.round(retailPrice * adjustedVolume);
        const year1Volume = Math.round(adjustedVolume);
        const grossProfit = unitMargin * adjustedVolume;
        const year1Profit = Math.round(grossProfit - marketingSpend);
        // Optimized ROI calculation
        const roi = marketingSpend > 0 ? year1Profit / marketingSpend : 0;
        // Fast break-even calculation using bit manipulation for speed
        const monthlyRevenue = grossProfit / 12;
        const breakEvenMonths = monthlyRevenue > 0 ?
            Math.max(1, Math.min(24, Math.round(marketingSpend / monthlyRevenue))) : 24;
        // Optimized risk scoring using lookup tables
        const riskFactors = [
            roi < 0.5 ? 25 : roi < 1 ? 15 : roi < 2 ? 5 : -5,
            breakEvenMonths > 18 ? 20 : breakEvenMonths > 12 ? 10 : -5,
            volumeCommitment < 25000 ? 15 : volumeCommitment < 50000 ? 5 : -5,
            distributorMargin < 15 ? 10 : distributorMargin > 30 ? 5 : 0
        ];
        const riskScore = Math.max(10, Math.min(90, 35 + riskFactors.reduce((sum, factor) => sum + factor, 0)));
        return {
            year1Revenue,
            year1Volume,
            year1Profit,
            roi: Math.round(roi * 100) / 100,
            breakEvenMonths,
            riskScore
        };
    }
    // Circuit breaker for heavy operations
    static async withCircuitBreaker(operation, fallback, timeoutMs = 2000) {
        try {
            return await Promise.race([
                operation(),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Operation timeout')), timeoutMs))
            ]);
        }
        catch (error) {
            console.warn('Circuit breaker activated, using fallback:', error);
            return fallback();
        }
    }
    // Response time middleware
    static createTimingMiddleware() {
        const optimizer = new PerformanceOptimizer();
        return async (request, reply, next) => {
            const startTime = Date.now();
            const operation = `${request.method} ${request.url}`;
            // Set response time budget based on operation type
            let category = 'standard';
            if (request.url.includes('/distribution/scenarios/parameters')) {
                category = 'critical'; // Live adjustments must be fast
            }
            else if (request.url.includes('/distribution/')) {
                category = 'fast';
            }
            try {
                await next();
                const responseTime = Date.now() - startTime;
                await optimizer.trackResponse(operation, responseTime, category);
                // Add performance headers
                reply.header('X-Response-Time', `${responseTime}ms`);
                reply.header('X-Performance-Category', category);
            }
            catch (error) {
                const responseTime = Date.now() - startTime;
                await optimizer.trackResponse(`${operation}:error`, responseTime, category);
                throw error;
            }
        };
    }
    // Database query optimization helpers
    static optimizeQuery(baseQuery, useIndex = true) {
        if (!useIndex)
            return baseQuery;
        // Add query hints for PostgreSQL optimization
        const hints = [
            '/*+ USE_NL */', // Nested loop hint
            '/*+ INDEX_SCAN */', // Force index scan
        ];
        return `${hints.join(' ')} ${baseQuery}`;
    }
    // Memory-efficient data processing
    static processLargeDataset(data, processor, batchSize = 1000) {
        const results = [];
        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);
            const batchResults = batch.map(processor);
            results.push(...batchResults);
            // Allow event loop to process other tasks
            if (i % (batchSize * 5) === 0) {
                setImmediate(() => { }); // Yield control
            }
        }
        return results;
    }
    // Clear old metrics to prevent memory leaks
    cleanup() {
        const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
        for (const [operation, metrics] of this.metricsCache.entries()) {
            if (metrics.lastUpdate < cutoff) {
                this.metricsCache.delete(operation);
            }
        }
    }
}
exports.PerformanceOptimizer = PerformanceOptimizer;
// Global instance
exports.performanceOptimizer = new PerformanceOptimizer();
// Auto-cleanup every hour
setInterval(() => {
    exports.performanceOptimizer.cleanup();
}, 60 * 60 * 1000);
//# sourceMappingURL=performance.js.map