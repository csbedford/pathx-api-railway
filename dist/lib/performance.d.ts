export declare class PerformanceOptimizer {
    private responseTimeTargets;
    private metricsCache;
    trackResponse(operation: string, responseTime: number, category?: 'critical' | 'fast' | 'standard'): Promise<void>;
    getMetrics(operation?: string): any;
    static fastProjectionCalculation(parameters: {
        msrp: number;
        distributorMargin: number;
        retailerMargin: number;
        volumeCommitment: number;
        marketingSpend: number;
        seasonalAdjustment: number;
    }): {
        year1Revenue: number;
        year1Volume: number;
        year1Profit: number;
        roi: number;
        breakEvenMonths: number;
        riskScore: number;
    };
    static withCircuitBreaker<T>(operation: () => Promise<T>, fallback: () => T, timeoutMs?: number): Promise<T>;
    static createTimingMiddleware(): (request: any, reply: any, next: any) => Promise<void>;
    static optimizeQuery(baseQuery: string, useIndex?: boolean): string;
    static processLargeDataset<T, R>(data: T[], processor: (item: T) => R, batchSize?: number): R[];
    cleanup(): void;
}
export declare const performanceOptimizer: PerformanceOptimizer;
//# sourceMappingURL=performance.d.ts.map