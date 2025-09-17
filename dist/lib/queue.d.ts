import Bull from 'bull';
export interface DistributionCalculationJob {
    campaignId: string;
    scenarioId: string;
    parameters: {
        msrp: number;
        distributorMargin: number;
        retailerMargin: number;
        volumeCommitment: number;
        marketingSpend: number;
        seasonalAdjustment: number;
    };
    userId?: string;
}
export interface PDFGenerationJob {
    sessionId: string;
    campaignId: string;
    format: 'pdf' | 'excel' | 'csv';
    data: any;
    userId?: string;
}
export interface MaterializedViewRefreshJob {
    viewName: string;
    filters?: Record<string, any>;
}
declare class JobQueue {
    private distributionQueue;
    private pdfQueue;
    private dbQueue;
    constructor();
    private setupProcessors;
    queueDistributionCalculation(data: DistributionCalculationJob, priority?: number): Promise<Bull.Job<DistributionCalculationJob>>;
    queuePDFGeneration(data: PDFGenerationJob): Promise<Bull.Job<PDFGenerationJob>>;
    queueViewRefresh(data: MaterializedViewRefreshJob): Promise<Bull.Job<MaterializedViewRefreshJob>>;
    getJobStatus(queueName: string, jobId: string): Promise<{
        status: string;
        progress: number;
        result?: any;
        error?: any;
    }>;
    private calculateProjectionsOptimized;
    private generatePDF;
    private generateExcel;
    private generateCSV;
    private refreshMaterializedView;
    shutdown(): Promise<void>;
}
export declare const jobQueue: JobQueue;
export {};
//# sourceMappingURL=queue.d.ts.map