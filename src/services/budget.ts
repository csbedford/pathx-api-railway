/**
 * Budget service with distribution constraints integration.
 * 
 * Provides budget validation and management with optional distribution constraints,
 * ensuring budgets align with marketing funds, channel allocations, and cash flow requirements.
 */

// Budget types
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

// Distribution constraints from distribution service
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

// Budget validation result
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

// Budget validation input
export interface IBudgetValidationInput {
  budget: IBudget;
  distributionConstraints?: IDistributionConstraints;
  campaignDuration?: number; // months
  startDate?: Date;
}

// Main budget service
export class BudgetService {
  
  async validateBudget(input: IBudgetValidationInput): Promise<IBudgetValidationResult> {
    const { budget, distributionConstraints, campaignDuration = 12, startDate = new Date() } = input;
    
    const result: IBudgetValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      recommendations: []
    };

    // Basic budget validation
    this.validateBasicBudget(budget, result);

    // Distribution constraints validation if provided
    if (distributionConstraints) {
      result.distributionCompliance = await this.validateDistributionConstraints(
        budget, 
        distributionConstraints, 
        campaignDuration, 
        startDate
      );
      
      this.applyDistributionValidationResults(result, result.distributionCompliance);
    }

    // Generate recommendations
    this.generateRecommendations(budget, distributionConstraints, result);

    // Set overall validity
    result.isValid = result.errors.length === 0;

    return result;
  }

  private validateBasicBudget(budget: IBudget, result: IBudgetValidationResult): void {
    // Check total budget is positive
    if (budget.total <= 0) {
      result.errors.push('Budget total must be greater than zero');
    }

    // Check currency is valid
    if (!budget.currency || budget.currency.length !== 3) {
      result.errors.push('Budget currency must be a valid 3-letter currency code');
    }

    // Check spent amount doesn't exceed total
    if (budget.spent && budget.spent > budget.total) {
      result.errors.push('Spent amount cannot exceed total budget');
    }

    // Validate allocations if present
    if (budget.allocated && budget.allocated.length > 0) {
      this.validateAllocations(budget.allocated, budget.total, result);
    }

    // Validate budget constraints
    if (budget.constraints) {
      this.validateBudgetConstraints(budget.constraints, budget.total, result);
    }
  }

  private validateAllocations(allocations: IBudgetAllocation[], total: number, result: IBudgetValidationResult): void {
    const totalAllocated = allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
    const totalPercentage = allocations.reduce((sum, alloc) => sum + alloc.percentage, 0);

    if (totalAllocated > total) {
      result.errors.push(`Total allocated amount (${totalAllocated}) exceeds budget total (${total})`);
    }

    if (Math.abs(totalPercentage - 100) > 0.01) {
      result.warnings.push(`Allocation percentages total ${totalPercentage}% instead of 100%`);
    }

    // Check individual allocations
    allocations.forEach((alloc, index) => {
      if (alloc.amount < 0) {
        result.errors.push(`Allocation ${index} has negative amount`);
      }
      if (alloc.percentage < 0 || alloc.percentage > 100) {
        result.errors.push(`Allocation ${index} has invalid percentage: ${alloc.percentage}%`);
      }
    });
  }

  private validateBudgetConstraints(constraints: IBudgetConstraints, total: number, result: IBudgetValidationResult): void {
    if (constraints.maxMonthlySpend && constraints.maxMonthlySpend > total) {
      result.warnings.push('Maximum monthly spend exceeds total budget');
    }

    if (constraints.minReserve && constraints.minReserve > total * 0.5) {
      result.warnings.push('Minimum reserve is more than 50% of total budget');
    }

    if (constraints.cashFlowConstraints) {
      this.validateCashFlowConstraints(constraints.cashFlowConstraints, total, result);
    }
  }

  private validateCashFlowConstraints(cashFlow: ICashFlowConstraints, total: number, result: IBudgetValidationResult): void {
    if (cashFlow.maxDailySpend && cashFlow.maxDailySpend * 30 > total) {
      result.warnings.push('Maximum daily spend would exceed total budget in 30 days');
    }

    if (cashFlow.minimumCashBuffer && cashFlow.minimumCashBuffer > total * 0.3) {
      result.warnings.push('Minimum cash buffer is more than 30% of total budget');
    }
  }

  private async validateDistributionConstraints(
    budget: IBudget,
    constraints: IDistributionConstraints,
    campaignDuration: number,
    startDate: Date
  ): Promise<IDistributionCompliance> {
    const compliance: IDistributionCompliance = {
      fundsCompliant: true,
      channelCompliant: true,
      cashFlowCompliant: true,
      seasonalCompliant: true,
      details: {
        availableFunds: constraints.availableMarketingFunds,
        requestedAmount: budget.total,
        channelViolations: [],
        cashFlowIssues: [],
        seasonalWarnings: []
      }
    };

    // Validate available marketing funds
    if (budget.total > constraints.availableMarketingFunds) {
      compliance.fundsCompliant = false;
      compliance.details.channelViolations.push(
        `Budget total (${budget.total}) exceeds available marketing funds (${constraints.availableMarketingFunds})`
      );
    }

    // Validate channel allocation requirements
    if (budget.allocated && constraints.channelAllocationRequirements.length > 0) {
      this.validateChannelRequirements(budget.allocated, constraints.channelAllocationRequirements, compliance);
    }

    // Validate cash flow constraints
    if (constraints.cashFlowConstraints) {
      this.validateDistributionCashFlow(budget, constraints.cashFlowConstraints, campaignDuration, compliance);
    }

    // Validate seasonal adjustments
    if (constraints.seasonalAdjustments) {
      this.validateSeasonalConstraints(budget, constraints.seasonalAdjustments, startDate, campaignDuration, compliance);
    }

    // Validate minimum spend requirements
    if (constraints.minimumSpendRequirements && budget.allocated) {
      this.validateMinimumSpendRequirements(budget.allocated, constraints.minimumSpendRequirements, compliance);
    }

    return compliance;
  }

  private validateChannelRequirements(
    allocations: IBudgetAllocation[],
    requirements: IChannelRequirement[],
    compliance: IDistributionCompliance
  ): void {
    requirements.forEach(req => {
      const allocation = allocations.find(alloc => alloc.channel === req.channel);
      
      if (!allocation) {
        compliance.channelCompliant = false;
        compliance.details.channelViolations.push(`Missing allocation for required channel: ${req.channel}`);
        return;
      }

      if (allocation.amount < req.minAllocation) {
        compliance.channelCompliant = false;
        compliance.details.channelViolations.push(
          `Channel ${req.channel} allocation (${allocation.amount}) below minimum (${req.minAllocation})`
        );
      }

      if (allocation.amount > req.maxAllocation) {
        compliance.channelCompliant = false;
        compliance.details.channelViolations.push(
          `Channel ${req.channel} allocation (${allocation.amount}) exceeds maximum (${req.maxAllocation})`
        );
      }

      if (req.requiredPercentage && Math.abs(allocation.percentage - req.requiredPercentage) > 1) {
        compliance.channelCompliant = false;
        compliance.details.channelViolations.push(
          `Channel ${req.channel} percentage (${allocation.percentage}%) differs from required (${req.requiredPercentage}%)`
        );
      }
    });
  }

  private validateDistributionCashFlow(
    budget: IBudget,
    constraints: ICashFlowConstraints,
    campaignDuration: number,
    compliance: IDistributionCompliance
  ): void {
    const monthlySpend = budget.total / campaignDuration;
    const dailySpend = monthlySpend / 30;

    if (constraints.maxDailySpend && dailySpend > constraints.maxDailySpend) {
      compliance.cashFlowCompliant = false;
      compliance.details.cashFlowIssues.push(
        `Projected daily spend (${dailySpend.toFixed(2)}) exceeds limit (${constraints.maxDailySpend})`
      );
    }

    if (constraints.minimumCashBuffer) {
      const requiredBuffer = budget.total * 0.1; // 10% buffer
      if (constraints.minimumCashBuffer > requiredBuffer) {
        compliance.details.cashFlowIssues.push(
          `Consider increasing cash buffer to ${constraints.minimumCashBuffer} (currently ${requiredBuffer})`
        );
      }
    }
  }

  private validateSeasonalConstraints(
    budget: IBudget,
    seasonalAdjustments: ISeasonalAdjustment[],
    startDate: Date,
    campaignDuration: number,
    compliance: IDistributionCompliance
  ): void {
    const monthlyBudget = budget.total / campaignDuration;
    
    for (let i = 0; i < campaignDuration; i++) {
      const month = (startDate.getMonth() + i) % 12 + 1;
      const adjustment = seasonalAdjustments.find(adj => adj.month === month);
      
      if (adjustment) {
        const adjustedSpend = monthlyBudget * adjustment.adjustmentFactor;
        const maxAllowedSpend = adjustment.maxSpendMultiplier 
          ? monthlyBudget * adjustment.maxSpendMultiplier 
          : monthlyBudget * 1.5;

        if (adjustedSpend > maxAllowedSpend) {
          compliance.seasonalCompliant = false;
          compliance.details.seasonalWarnings.push(
            `Month ${month}: Adjusted spend (${adjustedSpend.toFixed(2)}) exceeds maximum (${maxAllowedSpend.toFixed(2)})`
          );
        }
      }
    }
  }

  private validateMinimumSpendRequirements(
    allocations: IBudgetAllocation[],
    requirements: IMinimumSpendRequirement[],
    compliance: IDistributionCompliance
  ): void {
    requirements.forEach(req => {
      const allocation = allocations.find(alloc => alloc.channel === req.channel);
      
      if (!allocation || allocation.amount < req.minimumAmount) {
        compliance.channelCompliant = false;
        const current = allocation ? allocation.amount : 0;
        compliance.details.channelViolations.push(
          `Channel ${req.channel} requires minimum ${req.minimumAmount} (current: ${current}) - ${req.reason}`
        );
      }
    });
  }

  private applyDistributionValidationResults(
    result: IBudgetValidationResult,
    compliance: IDistributionCompliance
  ): void {
    if (!compliance.fundsCompliant) {
      result.errors.push('Budget exceeds available marketing funds');
    }

    if (!compliance.channelCompliant) {
      result.errors.push(...compliance.details.channelViolations);
    }

    if (!compliance.cashFlowCompliant) {
      result.errors.push(...compliance.details.cashFlowIssues);
    }

    if (!compliance.seasonalCompliant) {
      result.warnings.push(...compliance.details.seasonalWarnings);
    }
  }

  private generateRecommendations(
    budget: IBudget,
    constraints: IDistributionConstraints | undefined,
    result: IBudgetValidationResult
  ): void {
    // Basic recommendations
    if (!budget.allocated || budget.allocated.length === 0) {
      result.recommendations.push('Consider adding channel allocations for better budget tracking');
    }

    if (!budget.constraints) {
      result.recommendations.push('Consider adding budget constraints for better financial control');
    }

    // Distribution-based recommendations
    if (constraints) {
      if (budget.total < constraints.availableMarketingFunds * 0.8) {
        result.recommendations.push('Budget utilizes only ' + 
          Math.round((budget.total / constraints.availableMarketingFunds) * 100) + 
          '% of available marketing funds. Consider increasing budget for better reach.');
      }

      if (constraints.channelAllocationRequirements.length > 0 && (!budget.allocated || budget.allocated.length === 0)) {
        result.recommendations.push('Distribution constraints specify channel requirements. Consider adding channel allocations.');
      }

      if (constraints.seasonalAdjustments && constraints.seasonalAdjustments.length > 0) {
        result.recommendations.push('Seasonal patterns detected. Consider adjusting monthly spend based on seasonal factors.');
      }
    }
  }

  async optimizeBudget(input: IBudgetValidationInput): Promise<IBudget> {
    const validation = await this.validateBudget(input);
    
    if (validation.isValid) {
      return input.budget;
    }

    // Create optimized budget based on constraints
    const optimized: IBudget = { ...input.budget };

    if (input.distributionConstraints) {
      // Adjust total if exceeds available funds
      if (optimized.total > input.distributionConstraints.availableMarketingFunds) {
        optimized.total = input.distributionConstraints.availableMarketingFunds;
      }

      // Optimize channel allocations based on requirements
      if (input.distributionConstraints.channelAllocationRequirements.length > 0) {
        optimized.allocated = this.optimizeChannelAllocations(
          optimized.total,
          input.distributionConstraints.channelAllocationRequirements
        );
      }
    }

    return optimized;
  }

  private optimizeChannelAllocations(
    totalBudget: number,
    requirements: IChannelRequirement[]
  ): IBudgetAllocation[] {
    const allocations: IBudgetAllocation[] = [];
    let remainingBudget = totalBudget;

    // First, allocate minimum amounts
    requirements.forEach(req => {
      const minAmount = Math.min(req.minAllocation, remainingBudget);
      allocations.push({
        channel: req.channel,
        amount: minAmount,
        percentage: (minAmount / totalBudget) * 100
      });
      remainingBudget -= minAmount;
    });

    // Distribute remaining budget proportionally
    if (remainingBudget > 0) {
      const totalMinAllocations = requirements.reduce((sum, req) => sum + req.minAllocation, 0);
      
      requirements.forEach((req, index) => {
        const proportion = req.minAllocation / totalMinAllocations;
        const additionalAmount = Math.min(
          remainingBudget * proportion,
          req.maxAllocation - allocations[index].amount
        );
        
        allocations[index].amount += additionalAmount;
        allocations[index].percentage = (allocations[index].amount / totalBudget) * 100;
      });
    }

    return allocations;
  }
}

// Export singleton instance
export const budgetService = new BudgetService();