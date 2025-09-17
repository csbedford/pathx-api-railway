/**
 * Campaign service with distribution module integration.
 *
 * Provides campaign management with optional distribution strategy support,
 * maintaining backward compatibility while enabling advanced distribution
 * planning and volume projections.
 */
import { type ICreateCampaignInput, type IUpdateCampaignInput } from '../repositories/campaign.repository';
import type { Campaign } from '@prisma/client';
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
export declare class CampaignService {
    private distributionClient;
    constructor();
    create(input: ICreateCampaignWithDistributionInput): Promise<ICampaignWithDistribution>;
    findById(id: string, includeDistribution?: boolean): Promise<ICampaignWithDistribution | null>;
    list(includeDistribution?: boolean): Promise<ICampaignWithDistribution[]>;
    update(id: string, input: IUpdateCampaignWithDistributionInput): Promise<ICampaignWithDistribution>;
    delete(id: string): Promise<void>;
    createDistributionProjection(campaignId: string, request: IDistributionRequest): Promise<DistributionProjection>;
    getDistributionProjection(campaignId: string): Promise<DistributionProjection | null>;
    uploadDistributionIntelligence(campaignId: string, file: any, metadata?: Record<string, any>): Promise<string>;
    isDistributionModuleEnabled(): boolean;
}
export declare const campaignService: CampaignService;
export {};
//# sourceMappingURL=campaigns.d.ts.map