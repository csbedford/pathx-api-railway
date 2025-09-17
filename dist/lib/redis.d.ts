import Redis from 'ioredis';
export declare class RedisClient {
    private static instance;
    static getInstance(): Redis;
    static disconnect(): Promise<void>;
}
export declare class CacheService {
    private redis;
    private defaultTTL;
    constructor();
    get<T>(key: string): Promise<T | null>;
    set(key: string, value: any, ttl?: number): Promise<void>;
    del(key: string): Promise<void>;
    delPattern(pattern: string): Promise<void>;
    getOrSet<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T>;
    getStaleWhileRevalidate<T>(key: string, fetcher: () => Promise<T>, staleTTL?: number, // 1 minute stale
    freshTTL?: number): Promise<T>;
    private refreshCache;
    createDistributionKey(campaignId: string, scenarioId?: string): string;
    createProjectionKey(campaignId: string, parameters: Record<string, any>): string;
}
export declare const cacheService: CacheService;
//# sourceMappingURL=redis.d.ts.map