"use strict";
/**
 * Campaign service with distribution module integration.
 *
 * Provides campaign management with optional distribution strategy support,
 * maintaining backward compatibility while enabling advanced distribution
 * planning and volume projections.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignService = exports.CampaignService = void 0;
const campaign_repository_1 = require("../repositories/campaign.repository");
// Feature flag for distribution module
const isDistributionEnabled = () => {
    return process.env.ENABLE_DISTRIBUTION_MODULE === 'true';
};
// Distribution service client (HTTP client to distribution service)
class DistributionServiceClient {
    baseUrl;
    constructor() {
        this.baseUrl = process.env.DISTRIBUTION_SERVICE_URL || 'http://localhost:8002';
    }
    async createProjection(campaignId, request) {
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
        }
        catch (error) {
            console.error('Failed to create distribution projection:', error);
            throw new Error('Distribution service unavailable');
        }
    }
    async getIntelligence(brandId) {
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
        }
        catch (error) {
            console.error('Failed to fetch distribution intelligence:', error);
            return []; // Graceful degradation
        }
    }
    async uploadIntelligence(brandId, file, metadata = {}) {
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
        }
        catch (error) {
            console.error('Failed to upload intelligence:', error);
            throw new Error('Distribution service unavailable');
        }
    }
}
// Main campaigns service
class CampaignService {
    distributionClient;
    constructor() {
        this.distributionClient = new DistributionServiceClient();
    }
    async create(input) {
        // Create campaign using existing repository
        const { distributionStrategyId, ...campaignInput } = input;
        const campaign = await campaign_repository_1.CampaignRepository.create(campaignInput);
        // Add distribution strategy ID to objectives if provided
        if (distributionStrategyId && isDistributionEnabled()) {
            const updatedObjectives = {
                ...campaign.objectives,
                distributionStrategyId,
            };
            const updatedCampaign = await campaign_repository_1.CampaignRepository.update(campaign.id, {
                objectives: updatedObjectives,
            });
            return {
                ...updatedCampaign,
                distributionStrategyId,
            };
        }
        return campaign;
    }
    async findById(id, includeDistribution = false) {
        const campaign = await campaign_repository_1.CampaignRepository.findById(id);
        if (!campaign)
            return null;
        // Extract distribution strategy ID from objectives
        const objectives = campaign.objectives;
        const distributionStrategyId = objectives?.distributionStrategyId;
        const result = {
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
            }
            catch (error) {
                console.warn('Failed to fetch distribution data for campaign:', id, error);
                // Continue without distribution data (graceful degradation)
            }
        }
        return result;
    }
    async list(includeDistribution = false) {
        const campaigns = await campaign_repository_1.CampaignRepository.list();
        return Promise.all(campaigns.map(async (campaign) => {
            const objectives = campaign.objectives;
            const distributionStrategyId = objectives?.distributionStrategyId;
            const result = {
                ...campaign,
                distributionStrategyId,
            };
            // Fetch distribution data if requested and available
            if (includeDistribution && isDistributionEnabled() && distributionStrategyId && campaign.brandId) {
                try {
                    result.distributionIntelligence = await this.distributionClient.getIntelligence(campaign.brandId);
                }
                catch (error) {
                    console.warn('Failed to fetch distribution data for campaign:', campaign.id, error);
                    // Continue without distribution data
                }
            }
            return result;
        }));
    }
    async update(id, input) {
        const { distributionStrategyId, ...updateInput } = input;
        // Update distribution strategy ID in objectives if provided
        if (distributionStrategyId !== undefined && isDistributionEnabled()) {
            const existing = await campaign_repository_1.CampaignRepository.findById(id);
            if (!existing) {
                throw new Error('Campaign not found');
            }
            const updatedObjectives = {
                ...existing.objectives,
                distributionStrategyId: distributionStrategyId || undefined,
            };
            updateInput.objectives = updatedObjectives;
        }
        const updatedCampaign = await campaign_repository_1.CampaignRepository.update(id, updateInput);
        const objectives = updatedCampaign.objectives;
        return {
            ...updatedCampaign,
            distributionStrategyId: objectives?.distributionStrategyId,
        };
    }
    async delete(id) {
        await campaign_repository_1.CampaignRepository.delete(id);
    }
    // Distribution-specific methods
    async createDistributionProjection(campaignId, request) {
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
    async getDistributionProjection(campaignId) {
        if (!isDistributionEnabled()) {
            return null;
        }
        const campaign = await this.findById(campaignId, true);
        return campaign?.distributionProjection || null;
    }
    async uploadDistributionIntelligence(campaignId, file, metadata = {}) {
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
    isDistributionModuleEnabled() {
        return isDistributionEnabled();
    }
}
exports.CampaignService = CampaignService;
// Export singleton instance
exports.campaignService = new CampaignService();
//# sourceMappingURL=campaigns.js.map