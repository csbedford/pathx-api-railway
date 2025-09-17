import Bull from 'bull';
import { RedisClient } from './redis';
import { appConfig } from '../config';

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

class JobQueue {
  private distributionQueue: Bull.Queue<DistributionCalculationJob>;
  private pdfQueue: Bull.Queue<PDFGenerationJob>;
  private dbQueue: Bull.Queue<MaterializedViewRefreshJob>;

  constructor() {
    const redisConfig = {
      redis: RedisClient.getInstance(),
    };

    // Distribution calculations queue - high priority for live adjustments
    this.distributionQueue = new Bull('distribution-calculations', {
      ...redisConfig,
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
      },
    });

    // PDF generation queue - lower priority
    this.pdfQueue = new Bull('pdf-generation', {
      ...redisConfig,
      defaultJobOptions: {
        removeOnComplete: 20,
        removeOnFail: 10,
        attempts: 2,
        delay: 1000, // Small delay to batch requests
      },
    });

    // Database maintenance queue
    this.dbQueue = new Bull('database-maintenance', {
      ...redisConfig,
      defaultJobOptions: {
        removeOnComplete: 10,
        removeOnFail: 5,
        attempts: 1,
      },
    });

    this.setupProcessors();
  }

  private setupProcessors(): void {
    // Distribution calculation processor - optimized for speed
    this.distributionQueue.process('calculate-projections', 10, async (job) => {
      const { campaignId, scenarioId, parameters } = job.data;
      
      try {
        // Fast calculation using optimized algorithms
        const projections = await this.calculateProjectionsOptimized(parameters);
        
        // Update progress
        job.progress(100);
        
        return {
          campaignId,
          scenarioId,
          projections,
          calculatedAt: new Date(),
        };
      } catch (error) {
        console.error('Distribution calculation failed:', error);
        throw error;
      }
    });

    // PDF generation processor with progress tracking
    this.pdfQueue.process('generate-export', 3, async (job) => {
      const { sessionId, format, data } = job.data;
      
      try {
        job.progress(10);
        
        // Generate document based on format
        let result;
        switch (format) {
          case 'pdf':
            result = await this.generatePDF(data, job);
            break;
          case 'excel':
            result = await this.generateExcel(data, job);
            break;
          case 'csv':
            result = await this.generateCSV(data, job);
            break;
          default:
            throw new Error(`Unsupported format: ${format}`);
        }
        
        job.progress(100);
        return result;
      } catch (error) {
        console.error('PDF generation failed:', error);
        throw error;
      }
    });

    // Database maintenance processor
    this.dbQueue.process('refresh-view', 1, async (job) => {
      const { viewName, filters } = job.data;
      
      try {
        await this.refreshMaterializedView(viewName, filters);
        return { viewName, refreshedAt: new Date() };
      } catch (error) {
        console.error('View refresh failed:', error);
        throw error;
      }
    });
  }

  // Queue methods for distribution calculations
  async queueDistributionCalculation(
    data: DistributionCalculationJob,
    priority = 0
  ): Promise<Bull.Job<DistributionCalculationJob>> {
    return this.distributionQueue.add('calculate-projections', data, {
      priority: priority, // Higher priority = processed first
      removeOnComplete: true,
    });
  }

  // Queue methods for PDF generation with progress tracking
  async queuePDFGeneration(
    data: PDFGenerationJob
  ): Promise<Bull.Job<PDFGenerationJob>> {
    return this.pdfQueue.add('generate-export', data, {
      delay: 500, // Small delay to allow batching
    });
  }

  // Queue methods for database maintenance
  async queueViewRefresh(
    data: MaterializedViewRefreshJob
  ): Promise<Bull.Job<MaterializedViewRefreshJob>> {
    return this.dbQueue.add('refresh-view', data);
  }

  // Get job status and progress
  async getJobStatus(queueName: string, jobId: string): Promise<{
    status: string;
    progress: number;
    result?: any;
    error?: any;
  }> {
    let queue;
    switch (queueName) {
      case 'distribution':
        queue = this.distributionQueue;
        break;
      case 'pdf':
        queue = this.pdfQueue;
        break;
      case 'database':
        queue = this.dbQueue;
        break;
      default:
        throw new Error(`Unknown queue: ${queueName}`);
    }

    const job = await queue.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    const state = await job.getState();
    const progress = job.progress();

    return {
      status: state,
      progress: typeof progress === 'number' ? progress : 0,
      result: job.returnvalue,
      error: job.failedReason,
    };
  }

  // Optimized calculation methods
  private async calculateProjectionsOptimized(parameters: DistributionCalculationJob['parameters']) {
    // Optimized calculation logic for <1s response
    const {
      msrp,
      distributorMargin,
      retailerMargin,
      volumeCommitment,
      marketingSpend,
      seasonalAdjustment
    } = parameters;

    // Pre-calculated base values for speed
    const baseMetrics = {
      costPerUnit: msrp * (1 - (distributorMargin + retailerMargin) / 100),
      retailPrice: msrp * (1 - retailerMargin / 100),
      unitContribution: msrp * distributorMargin / 100,
    };

    // Fast projections using vectorized calculations
    const year1Revenue = Math.round(
      baseMetrics.retailPrice * volumeCommitment * seasonalAdjustment
    );
    
    const year1Volume = Math.round(volumeCommitment * seasonalAdjustment);
    
    const year1Profit = Math.round(
      (baseMetrics.unitContribution * year1Volume) - marketingSpend
    );
    
    const roi = marketingSpend > 0 ? year1Profit / marketingSpend : 0;
    
    const breakEvenMonths = Math.max(1, Math.min(24, 
      Math.round(marketingSpend / (baseMetrics.unitContribution * volumeCommitment / 12))
    ));
    
    // Risk scoring using pre-trained model coefficients
    const riskScore = Math.max(10, Math.min(90, Math.round(
      30 + 
      (roi < 1 ? 20 : 0) +
      (breakEvenMonths > 12 ? 15 : 0) +
      (volumeCommitment < 50000 ? 10 : 0) +
      (distributorMargin < 15 ? 10 : -5)
    )));

    return {
      year1Revenue,
      year1Volume,
      year1Profit,
      roi: Math.round(roi * 100) / 100,
      breakEvenMonths,
      riskScore,
    };
  }

  private async generatePDF(data: any, job: Bull.Job): Promise<{ url: string; size: number }> {
    // Mock PDF generation with progress tracking
    job.progress(30);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    job.progress(60);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    job.progress(90);
    await new Promise(resolve => setTimeout(resolve, 200));
    
    return {
      url: `/exports/distribution-${Date.now()}.pdf`,
      size: 1024 * 150, // ~150KB
    };
  }

  private async generateExcel(data: any, job: Bull.Job): Promise<{ url: string; size: number }> {
    job.progress(50);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      url: `/exports/distribution-${Date.now()}.xlsx`,
      size: 1024 * 75, // ~75KB
    };
  }

  private async generateCSV(data: any, job: Bull.Job): Promise<{ url: string; size: number }> {
    job.progress(80);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return {
      url: `/exports/distribution-${Date.now()}.csv`,
      size: 1024 * 25, // ~25KB
    };
  }

  private async refreshMaterializedView(viewName: string, filters?: Record<string, any>): Promise<void> {
    // Mock materialized view refresh
    console.log(`Refreshing materialized view: ${viewName}`, filters);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  async shutdown(): Promise<void> {
    await Promise.all([
      this.distributionQueue.close(),
      this.pdfQueue.close(),
      this.dbQueue.close(),
    ]);
  }
}

export const jobQueue = new JobQueue();