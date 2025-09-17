import Redis from 'ioredis';
import { appConfig } from '../config';

export class RedisClient {
  private static instance: Redis | null = null;
  
  static getInstance(): Redis {
    if (!this.instance) {
      this.instance = new Redis(appConfig.REDIS_URL, {
        db: appConfig.REDIS_DB,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
    }
    return this.instance;
  }

  static async disconnect(): Promise<void> {
    if (this.instance) {
      await this.instance.disconnect();
      this.instance = null;
    }
  }
}

export class CacheService {
  private redis: Redis;
  private defaultTTL: number;

  constructor() {
    this.redis = RedisClient.getInstance();
    this.defaultTTL = appConfig.CACHE_TTL;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, ttl = this.defaultTTL): Promise<void> {
    try {
      await this.redis.setex(key, ttl, JSON.stringify(value));
    } catch (error) {
      console.error('Cache set error:', error);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (error) {
      console.error('Cache delete error:', error);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error);
    }
  }

  // Optimized cache with fallback for heavy calculations
  async getOrSet<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl = this.defaultTTL
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const fresh = await fetcher();
    await this.set(key, fresh, ttl);
    return fresh;
  }

  // Cache with stale-while-revalidate pattern for <3s responses
  async getStaleWhileRevalidate<T>(
    key: string,
    fetcher: () => Promise<T>,
    staleTTL = 60, // 1 minute stale
    freshTTL = this.defaultTTL
  ): Promise<T> {
    const staleKey = `${key}:stale`;
    
    // Try fresh cache first
    const fresh = await this.get<T>(key);
    if (fresh !== null) {
      return fresh;
    }

    // Fallback to stale cache for instant response
    const stale = await this.get<T>(staleKey);
    
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

  private async refreshCache<T>(
    key: string,
    staleKey: string,
    fetcher: () => Promise<T>,
    freshTTL: number,
    staleTTL: number
  ): Promise<void> {
    try {
      const fresh = await fetcher();
      await Promise.all([
        this.set(key, fresh, freshTTL),
        this.set(staleKey, fresh, staleTTL)
      ]);
    } catch (error) {
      console.error('Background cache refresh failed:', error);
    }
  }

  // Distribution modeling specific cache keys
  createDistributionKey(campaignId: string, scenarioId?: string): string {
    return scenarioId 
      ? `distribution:${campaignId}:scenario:${scenarioId}`
      : `distribution:${campaignId}:session`;
  }

  createProjectionKey(campaignId: string, parameters: Record<string, any>): string {
    const hash = Buffer.from(JSON.stringify(parameters)).toString('base64');
    return `projection:${campaignId}:${hash}`;
  }
}

export const cacheService = new CacheService();