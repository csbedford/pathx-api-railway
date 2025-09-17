"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distributionRoutes = void 0;
const zod_1 = require("zod");
const redis_1 = require("../lib/redis");
const queue_1 = require("../lib/queue");
const performance_1 = require("../lib/performance");
// Schemas for validation
const ScenarioParametersSchema = zod_1.z.object({
    msrp: zod_1.z.number().min(0.01).max(10000),
    distributorMargin: zod_1.z.number().min(0).max(100),
    retailerMargin: zod_1.z.number().min(0).max(100),
    volumeCommitment: zod_1.z.number().int().min(1).max(10000000),
    marketingSpend: zod_1.z.number().min(0).max(100000000),
    seasonalAdjustment: zod_1.z.number().min(0.1).max(5.0),
});
const UpdateParameterSchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    scenarioId: zod_1.z.string(),
    field: zod_1.z.string(),
    value: zod_1.z.union([zod_1.z.number(), zod_1.z.string(), zod_1.z.boolean()]),
});
const CreateScenarioSchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    baseScenarioId: zod_1.z.string(),
    name: zod_1.z.string().min(1).max(100),
});
const ExportRequestSchema = zod_1.z.object({
    sessionId: zod_1.z.string(),
    format: zod_1.z.enum(['pdf', 'excel', 'csv']),
});
// Route definitions
const distributionRoutes = async (fastify) => {
    // Get modeling session with caching
    fastify.get('/campaigns/:campaignId/distribution/modeling', {
        schema: {
            params: {
                type: 'object',
                properties: {
                    campaignId: { type: 'string' }
                },
                required: ['campaignId']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        campaignId: { type: 'string' },
                        scenarios: { type: 'array', items: {} },
                        currentScenario: { type: 'string' },
                        presentationMode: { type: 'boolean' },
                        lastSaved: { type: 'string' },
                        hasUnsavedChanges: { type: 'boolean' }
                    },
                    required: ['id', 'campaignId', 'scenarios', 'currentScenario', 'presentationMode', 'lastSaved', 'hasUnsavedChanges']
                }
            }
        },
    }, async (request) => {
        const { campaignId } = request.params;
        const cacheKey = redis_1.cacheService.createDistributionKey(campaignId);
        // Use stale-while-revalidate for <1s response
        const session = await redis_1.cacheService.getStaleWhileRevalidate(cacheKey, async () => {
            // Simulate fetching from database with optimized query
            return {
                id: `session-${campaignId}`,
                campaignId,
                scenarios: [
                    {
                        id: 'baseline',
                        name: 'Baseline',
                        description: 'Current baseline scenario',
                        isBaseline: true,
                        parameters: {
                            msrp: 32.99,
                            distributorMargin: 22,
                            retailerMargin: 35,
                            volumeCommitment: 75000,
                            marketingSpend: 150000,
                            seasonalAdjustment: 1.0
                        },
                        projections: {
                            year1Revenue: 2500000,
                            year1Volume: 75000,
                            year1Profit: 450000,
                            roi: 2.8,
                            breakEvenMonths: 8,
                            riskScore: 35
                        },
                        lastModified: new Date(),
                        changes: []
                    }
                ],
                currentScenario: 'baseline',
                presentationMode: false,
                lastSaved: new Date(Date.now() - 300000),
                hasUnsavedChanges: false
            };
        }, 60, // 1 minute stale cache
        300 // 5 minute fresh cache
        );
        return session;
    });
    // Update scenario parameter with fast response
    fastify.patch('/distribution/scenarios/parameters', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    sessionId: { type: 'string' },
                    scenarioId: { type: 'string' },
                    field: { type: 'string' },
                    value: { oneOf: [{ type: 'number' }, { type: 'string' }, { type: 'boolean' }] }
                },
                required: ['sessionId', 'scenarioId', 'field', 'value']
            },
            response: {
                200: {
                    type: 'object',
                    properties: {
                        projections: {
                            type: 'object',
                            properties: {
                                year1Revenue: { type: 'number' },
                                year1Volume: { type: 'number' },
                                year1Profit: { type: 'number' },
                                roi: { type: 'number' },
                                breakEvenMonths: { type: 'number' },
                                riskScore: { type: 'number' }
                            },
                            required: ['year1Revenue', 'year1Volume', 'year1Profit', 'roi', 'breakEvenMonths', 'riskScore']
                        },
                        calculationTime: { type: 'number' }
                    },
                    required: ['projections', 'calculationTime']
                }
            }
        },
    }, async (request) => {
        const { sessionId, scenarioId, field, value } = request.body;
        const startTime = Date.now();
        // Create cache key for this specific parameter combination
        const parametersCache = await redis_1.cacheService.get(`session:${sessionId}:scenario:${scenarioId}:params`) || {};
        const updatedParams = { ...parametersCache, [field]: value };
        const projectionKey = redis_1.cacheService.createProjectionKey(sessionId, updatedParams);
        // Check cache first for instant response
        let projections = await redis_1.cacheService.get(projectionKey);
        if (!projections) {
            // Queue calculation for background processing if complex
            const isComplexCalculation = Object.keys(updatedParams).length > 3;
            if (isComplexCalculation) {
                // Use optimized calculation for live adjustments
                const job = await queue_1.jobQueue.queueDistributionCalculation({
                    campaignId: sessionId,
                    scenarioId,
                    parameters: updatedParams,
                }, 10); // High priority
                // Wait up to 500ms for result, then return cached/estimated
                try {
                    const result = await Promise.race([
                        job.finished(),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 500))
                    ]);
                    projections = result.projections;
                }
                catch {
                    // Fallback to quick estimation
                    projections = await quickProjectionEstimate(updatedParams);
                }
            }
            else {
                // Direct calculation for simple changes
                projections = await quickProjectionEstimate(updatedParams);
            }
            // Cache result for 30 seconds (short TTL for live adjustments)
            await redis_1.cacheService.set(projectionKey, projections, 30);
        }
        // Update session cache
        await redis_1.cacheService.set(`session:${sessionId}:scenario:${scenarioId}:params`, updatedParams, 300);
        const calculationTime = Date.now() - startTime;
        return {
            projections,
            calculationTime,
        };
    });
    // Create new scenario
    fastify.post('/distribution/scenarios', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    sessionId: { type: 'string' },
                    baseScenarioId: { type: 'string' },
                    name: { type: 'string', minLength: 1, maxLength: 100 }
                },
                required: ['sessionId', 'baseScenarioId', 'name']
            }
        },
    }, async (request) => {
        const { sessionId, baseScenarioId, name } = request.body;
        // Create new scenario based on existing one
        const newScenario = {
            id: `scenario-${Date.now()}`,
            name,
            description: `Created from ${baseScenarioId}`,
            isBaseline: false,
            parameters: {
                msrp: 32.99,
                distributorMargin: 22,
                retailerMargin: 35,
                volumeCommitment: 75000,
                marketingSpend: 150000,
                seasonalAdjustment: 1.0
            },
            projections: {
                year1Revenue: 2500000,
                year1Volume: 75000,
                year1Profit: 450000,
                roi: 2.8,
                breakEvenMonths: 8,
                riskScore: 35
            },
            lastModified: new Date(),
            changes: []
        };
        // Invalidate session cache
        await redis_1.cacheService.del(`distribution:${sessionId}:session`);
        return newScenario;
    });
    // Export session with progress tracking
    fastify.post('/distribution/export', {
        schema: {
            body: {
                type: 'object',
                properties: {
                    sessionId: { type: 'string' },
                    format: { type: 'string', enum: ['pdf', 'excel', 'csv'] }
                },
                required: ['sessionId', 'format']
            }
        },
    }, async (request) => {
        const { sessionId, format } = request.body;
        // Queue export job
        const job = await queue_1.jobQueue.queuePDFGeneration({
            sessionId,
            campaignId: sessionId,
            format,
            data: {}, // Would include actual session data
        });
        return {
            jobId: job.id,
            status: 'queued',
            estimatedTime: format === 'pdf' ? 5000 : format === 'excel' ? 3000 : 1000,
        };
    });
    // Get export job status
    fastify.get('/distribution/export/:jobId/status', async (request) => {
        const { jobId } = request.params;
        try {
            const status = await queue_1.jobQueue.getJobStatus('pdf', jobId);
            return status;
        }
        catch (error) {
            request.log.error('Failed to get job status:', error);
            return { error: 'Job not found' };
        }
    });
    // Performance monitoring endpoint
    fastify.get('/distribution/metrics', async () => {
        // Mock performance metrics
        return {
            avgResponseTime: 250, // ms
            cacheHitRate: 85, // %
            activeJobs: {
                distribution: 3,
                pdf: 1,
                database: 0,
            },
            systemHealth: {
                redis: 'healthy',
                database: 'healthy',
                queue: 'healthy',
            },
        };
    });
    // Private helper methods
    async function quickProjectionEstimate(parameters) {
        // Use optimized calculation for <100ms response
        return performance_1.PerformanceOptimizer.fastProjectionCalculation({
            msrp: parameters.msrp || 32.99,
            distributorMargin: parameters.distributorMargin || 22,
            retailerMargin: parameters.retailerMargin || 35,
            volumeCommitment: parameters.volumeCommitment || 75000,
            marketingSpend: parameters.marketingSpend || 150000,
            seasonalAdjustment: parameters.seasonalAdjustment || 1.0
        });
    }
};
exports.distributionRoutes = distributionRoutes;
//# sourceMappingURL=distribution.js.map