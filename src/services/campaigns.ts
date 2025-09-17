/**
 * Campaign service with distribution module integration.
 * 
 * Provides campaign management with optional distribution strategy support,
 * maintaining backward compatibility while enabling advanced distribution
 * planning and volume projections.
 */

import { CampaignRepository, type ICreateCampaignInput, type IUpdateCampaignInput } from '../repositories/campaign.repository';
import type { Campaign } from '@prisma/client';

// Distribution service types (imported from distribution service when available)
interface DistributionProjection {
  campaign_id: string;
  scenario: string;
  projection_date: string;
  total_budget: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: number;
  overall_roi: number;
  account_projections: AccountProjection[];
  metadata: Record<string, any>;
}

interface AccountProjection {
  account_id: string;
  account_name: string;
  scenario: string;
  total_budget: number;
  total_impressions: number;
  total_clicks: number;
  total_conversions: number;
  total_revenue: number;
  average_cpm: number;
  average_cpc: number;
  overall_conversion_rate: number;
  roi: number;
}

interface DistributionIntelligence {
  intelligence_id: string;
  brand_id?: string;
  region_code?: string;
  parser_version: string;
  confidence_score: number;
  missing_sections: string[];
  extraction_timestamp: string;
  market_data: Record<string, any>;
  competitor_data: Record<string, any>;
  audience_insights: Record<string, any>;
  channel_performance: Record<string, any>;
  metadata: Record<string, any>;
}

// Extended campaign interface with distribution support
export interface ICampaignWithDistribution extends Campaign {
  distributionStrategyId?: string;
  distributionProjection?: DistributionProjection;
  distributionIntelligence?: DistributionIntelligence[];
}

export interface ICreateCampaignWithDistributionInput extends ICreateCampaignInput {
  distributionStrategyId?: string;
}

export interface IUpdateCampaignWithDistributionInput extends IUpdateCampaignInput {
  distributionStrategyId?: string;
}

export interface IDistributionRequest {
  scenario?: 'conservative' | 'moderate' | 'aggressive';
  projectionPeriods?: number;
  seasonalPattern?: 'retail' | 'b2b' | 'healthcare' | 'education' | 'travel' | 'flat';
  allocationMethod?: 'equal' | 'weighted_spend' | 'market_share' | 'audience_size';
  accountConfigs?: Array<{
    account_id: string;
    account_name: string;
    weight?: number;
    conversion_rate?: number;
    avg_order_value?: number;
    payment_terms_days?: number;
  }>;
}

// Feature flag for distribution module
const isDistributionEnabled = (): boolean => {
  return process.env.ENABLE_DISTRIBUTION_MODULE === 'true';
};

// Distribution service client (HTTP client to distribution service)
class DistributionServiceClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env.DISTRIBUTION_SERVICE_URL || 'http://localhost:8002';
  }

  async createProjection(campaignId: string, request: IDistributionRequest): Promise<DistributionProjection> {
    if (!isDistributionEnabled()) {
      throw new Error('Distribution module is not enabled');
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/distribution/projections`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaign_id: campaignId,
          scenario: request.scenario || 'moderate',
          projection_periods: request.projectionPeriods || 12,
          seasonal_pattern: request.seasonalPattern || 'retail',
          allocation_method: request.allocationMethod || 'weighted_spend',
          account_configs: request.accountConfigs || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Distribution service error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to create distribution projection:', error);
      throw new Error('Distribution service unavailable');
    }
  }

  async getIntelligence(brandId: string): Promise<DistributionIntelligence[]> {
    if (!isDistributionEnabled()) {
      return [];
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/distribution/intelligence/${brandId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return []; // No intelligence data found
        }
        throw new Error(`Distribution service error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.intelligence_records || [];
    } catch (error) {
      console.error('Failed to fetch distribution intelligence:', error);
      return []; // Graceful degradation
    }
  }

  async uploadIntelligence(brandId: string, file: any, metadata: Record<string, any> = {}): Promise<string> {
    if (!isDistributionEnabled()) {
      throw new Error('Distribution module is not enabled');
    }

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('brand_id', brandId);
      formData.append('region_code', metadata.region_code || 'US');
      formData.append('document_type', metadata.document_type || 'komerz');
      formData.append('parser_version', metadata.parser_version || '2.0');
      formData.append('metadata', JSON.stringify(metadata));

      const response = await fetch(`${this.baseUrl}/api/v1/distribution/intelligence/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Distribution service error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.intelligence_id;
    } catch (error) {
      console.error('Failed to upload intelligence:', error);
      throw new Error('Distribution service unavailable');
    }
  }
}

// Main campaigns service
export class CampaignService {
  private distributionClient: DistributionServiceClient;

  constructor() {
    this.distributionClient = new DistributionServiceClient();
  }

  async create(input: ICreateCampaignWithDistributionInput): Promise<ICampaignWithDistribution> {
    // Create campaign using existing repository
    const { distributionStrategyId, ...campaignInput } = input;
    const campaign = await CampaignRepository.create(campaignInput);

    // Add distribution strategy ID to objectives if provided
    if (distributionStrategyId && isDistributionEnabled()) {
      const updatedObjectives = {
        ...(campaign.objectives as any),
        distributionStrategyId,
      };
      
      const updatedCampaign = await CampaignRepository.update(campaign.id, {
        objectives: updatedObjectives,
      });

      return {
        ...updatedCampaign,
        distributionStrategyId,
      };
    }

    return campaign;
  }

  async findById(id: string, includeDistribution = false): Promise<ICampaignWithDistribution | null> {
    const campaign = await CampaignRepository.findById(id);
    if (!campaign) return null;

    // Extract distribution strategy ID from objectives
    const objectives = campaign.objectives as any;
    const distributionStrategyId = objectives?.distributionStrategyId;

    const result: ICampaignWithDistribution = {
      ...campaign,
      distributionStrategyId,
    };

    // Fetch distribution data if requested and available
    if (includeDistribution && isDistributionEnabled() && distributionStrategyId) {
      try {
        // Fetch distribution intelligence if brand ID is available
        if (campaign.brandId) {
          result.distributionIntelligence = await this.distributionClient.getIntelligence(campaign.brandId);
        }
      } catch (error) {
        console.warn('Failed to fetch distribution data for campaign:', id, error);
        // Continue without distribution data (graceful degradation)
      }
    }

    return result;
  }

  async list(includeDistribution = false): Promise<ICampaignWithDistribution[]> {
    const campaigns = await CampaignRepository.list();
    
    return Promise.all(
      campaigns.map(async (campaign) => {
        const objectives = campaign.objectives as any;
        const distributionStrategyId = objectives?.distributionStrategyId;

        const result: ICampaignWithDistribution = {
          ...campaign,
          distributionStrategyId,
        };

        // Fetch distribution data if requested and available
        if (includeDistribution && isDistributionEnabled() && distributionStrategyId && campaign.brandId) {
          try {
            result.distributionIntelligence = await this.distributionClient.getIntelligence(campaign.brandId);
          } catch (error) {
            console.warn('Failed to fetch distribution data for campaign:', campaign.id, error);
            // Continue without distribution data
          }
        }

        return result;
      })
    );
  }

  async update(id: string, input: IUpdateCampaignWithDistributionInput): Promise<ICampaignWithDistribution> {
    const { distributionStrategyId, ...updateInput } = input;

    // Update distribution strategy ID in objectives if provided
    if (distributionStrategyId !== undefined && isDistributionEnabled()) {
      const existing = await CampaignRepository.findById(id);
      if (!existing) {
        throw new Error('Campaign not found');
      }

      const updatedObjectives = {
        ...(existing.objectives as any),
        distributionStrategyId: distributionStrategyId || undefined,
      };

      updateInput.objectives = updatedObjectives;
    }

    const updatedCampaign = await CampaignRepository.update(id, updateInput);
    const objectives = updatedCampaign.objectives as any;

    return {
      ...updatedCampaign,
      distributionStrategyId: objectives?.distributionStrategyId,
    };
  }

  async delete(id: string): Promise<void> {
    await CampaignRepository.delete(id);
  }

  // Distribution-specific methods
  async createDistributionProjection(
    campaignId: string,
    request: IDistributionRequest
  ): Promise<DistributionProjection> {
    if (!isDistributionEnabled()) {
      throw new Error('Distribution module is not enabled');
    }

    // Verify campaign exists
    const campaign = await this.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    return this.distributionClient.createProjection(campaignId, request);
  }

  async getDistributionProjection(campaignId: string): Promise<DistributionProjection | null> {
    if (!isDistributionEnabled()) {
      return null;
    }

    const campaign = await this.findById(campaignId, true);
    return campaign?.distributionProjection || null;
  }

  async uploadDistributionIntelligence(
    campaignId: string,
    file: any,
    metadata: Record<string, any> = {}
  ): Promise<string> {
    if (!isDistributionEnabled()) {
      throw new Error('Distribution module is not enabled');
    }

    const campaign = await this.findById(campaignId);
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    if (!campaign.brandId) {
      throw new Error('Campaign must have a brand ID to upload intelligence');
    }

    return this.distributionClient.uploadIntelligence(campaign.brandId, file, metadata);
  }

  // Feature flag check
  isDistributionModuleEnabled(): boolean {
    return isDistributionEnabled();
  }
}

// Export singleton instance
export const campaignService = new CampaignService();