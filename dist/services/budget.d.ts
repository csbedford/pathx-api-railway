/**
 * Budget service with distribution constraints integration.
 *
 * Provides budget validation and management with optional distribution constraints,
 * ensuring budgets align with marketing funds, channel allocations, and cash flow requirements.
 */
export interface IBudget {
    total: number;
    currency: string;
    spent?: number;
    allocated?: IBudgetAllocation[];
    constraints?: IBudgetConstraints;
}
export interface IBudgetAllocation {
    channel: string;
    amount: number;
    percentage: number;
}
export interface IBudgetConstraints {
    maxMonthlySpend?: number;
    minReserve?: number;
    cashFlowConstraints?: ICashFlowConstraints;
}
export interface ICashFlowConstraints {
    maxDailySpend?: number;
    paymentTermsDays?: number;
    minimumCashBuffer?: number;
}
export interface IDistributionConstraints {
    availableMarketingFunds: number;
    channelAllocationRequirements: IChannelRequirement[];
    cashFlowConstraints: ICashFlowConstraints;
    seasonalAdjustments?: ISeasonalAdjustment[];
    minimumSpendRequirements?: IMinimumSpendRequirement[];
}
export interface IChannelRequirement {
    channel: string;
    minAllocation: number;
    maxAllocation: number;
    requiredPercentage?: number;
}
export interface ISeasonalAdjustment {
    month: number;
    adjustmentFactor: number;
    maxSpendMultiplier?: number;
}
export interface IMinimumSpendRequirement {
    channel: string;
    minimumAmount: number;
    reason: string;
}
export interface IBudgetValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    recommendations: string[];
    adjustedBudget?: IBudget;
    distributionCompliance?: IDistributionCompliance;
}
export interface IDistributionCompliance {
    fundsCompliant: boolean;
    channelCompliant: boolean;
    cashFlowCompliant: boolean;
    seasonalCompliant: boolean;
    details: {
        availableFunds: number;
        requestedAmount: number;
        channelViolations: string[];
        cashFlowIssues: string[];
        seasonalWarnings: string[];
    };
}
export interface IBudgetValidationInput {
    budget: IBudget;
    distributionConstraints?: IDistributionConstraints;
    campaignDuration?: number;
    startDate?: Date;
}
export declare class BudgetService {
    validateBudget(input: IBudgetValidationInput): Promise<IBudgetValidationResult>;
    private validateBasicBudget;
    private validateAllocations;
    private validateBudgetConstraints;
    private validateCashFlowConstraints;
    private validateDistributionConstraints;
    private validateChannelRequirements;
    private validateDistributionCashFlow;
    private validateSeasonalConstraints;
    private validateMinimumSpendRequirements;
    private applyDistributionValidationResults;
    private generateRecommendations;
    optimizeBudget(input: IBudgetValidationInput): Promise<IBudget>;
    private optimizeChannelAllocations;
}
export declare const budgetService: BudgetService;
//# sourceMappingURL=budget.d.ts.map