"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cacheService = exports.CacheService = exports.RedisClient = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const config_1 = require("../config");
class RedisClient {
    static instance = null;
    static getInstance() {
        if (!this.instance) {
            this.instance = new ioredis_1.default(config_1.appConfig.REDIS_URL, {
                db: config_1.appConfig.REDIS_DB,
                retryDelayOnFailover: 100,
                enableReadyCheck: false,
                maxRetriesPerRequest: 3,
                lazyConnect: true,
            });
        }
        return this.instance;
    }
    static async disconnect() {
        if (this.instance) {
            await this.instance.disconnect();
            this.instance = null;
        }
    }
}
exports.RedisClient = RedisClient;
class CacheService {
    redis;
    defaultTTL;
    constructor() {
        this.redis = RedisClient.getInstance();
        this.defaultTTL = config_1.appConfig.CACHE_TTL;
    }
    async get(key) {
        try {
            const data = await this.redis.get(key);
            return data ? JSON.parse(data) : null;
        }
        catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }
    async set(key, value, ttl = this.defaultTTL) {
        try {
            await this.redis.setex(key, ttl, JSON.stringify(value));
        }
        catch (error) {
            console.error('Cache set error:', error);
        }
    }
    async del(key) {
        try {
            await this.redis.del(key);
        }
        catch (error) {
            console.error('Cache delete error:', error);
        }
    }
    async delPattern(pattern) {
        try {
            const keys = await this.redis.keys(pattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
            }
        }
        catch (error) {
            console.error('Cache delete pattern error:', error);
        }
    }
    // Optimized cache with fallback for heavy calculations
    async getOrSet(key, fetcher, ttl = this.defaultTTL) {
        const cached = await this.get(key);
        if (cached !== null) {
            return cached;
        }
        const fresh = await fetcher();
        await this.set(key, fresh, ttl);
        return fresh;
    }
    // Cache with stale-while-revalidate pattern for <3s responses
    async getStaleWhileRevalidate(key, fetcher, staleTTL = 60, // 1 minute stale
    freshTTL = this.defaultTTL) {
        const staleKey = `${key}:stale`;
        // Try fresh cache first
        const fresh = await this.get(key);
        if (fresh !== null) {
            return fresh;
        }
        // Fallback to stale cache for instant response
        const stale = await this.get(staleKey);
        // Background refresh for next request
        if (stale !== null) {
            // Don't await - run in background
            this.refreshCache(key, staleKey, fetcher, freshTTL, staleTTL);
            return stale;
        }
        // No cache available - fetch fresh
        const data = await fetcher();
        await Promise.all([
            this.set(key, data, freshTTL),
            this.set(staleKey, data, staleTTL)
        ]);
        return data;
    }
    async refreshCache(key, staleKey, fetcher, freshTTL, staleTTL) {
        try {
            const fresh = await fetcher();
            await Promise.all([
                this.set(key, fresh, freshTTL),
                this.set(staleKey, fresh, staleTTL)
            ]);
        }
        catch (error) {
            console.error('Background cache refresh failed:', error);
        }
    }
    // Distribution modeling specific cache keys
    createDistributionKey(campaignId, scenarioId) {
        return scenarioId
            ? `distribution:${campaignId}:scenario:${scenarioId}`
            : `distribution:${campaignId}:session`;
    }
    createProjectionKey(campaignId, parameters) {
        const hash = Buffer.from(JSON.stringify(parameters)).toString('base64');
        return `projection:${campaignId}:${hash}`;
    }
}
exports.CacheService = CacheService;
exports.cacheService = new CacheService();
//# sourceMappingURL=redis.js.map