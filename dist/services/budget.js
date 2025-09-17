"use strict";
/**
 * Budget service with distribution constraints integration.
 *
 * Provides budget validation and management with optional distribution constraints,
 * ensuring budgets align with marketing funds, channel allocations, and cash flow requirements.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.budgetService = exports.BudgetService = void 0;
// Main budget service
class BudgetService {
    async validateBudget(input) {
        const { budget, distributionConstraints, campaignDuration = 12, startDate = new Date() } = input;
        const result = {
            isValid: true,
            errors: [],
            warnings: [],
            recommendations: []
        };
        // Basic budget validation
        this.validateBasicBudget(budget, result);
        // Distribution constraints validation if provided
        if (distributionConstraints) {
            result.distributionCompliance = await this.validateDistributionConstraints(budget, distributionConstraints, campaignDuration, startDate);
            this.applyDistributionValidationResults(result, result.distributionCompliance);
        }
        // Generate recommendations
        this.generateRecommendations(budget, distributionConstraints, result);
        // Set overall validity
        result.isValid = result.errors.length === 0;
        return result;
    }
    validateBasicBudget(budget, result) {
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
    validateAllocations(allocations, total, result) {
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
    validateBudgetConstraints(constraints, total, result) {
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
    validateCashFlowConstraints(cashFlow, total, result) {
        if (cashFlow.maxDailySpend && cashFlow.maxDailySpend * 30 > total) {
            result.warnings.push('Maximum daily spend would exceed total budget in 30 days');
        }
        if (cashFlow.minimumCashBuffer && cashFlow.minimumCashBuffer > total * 0.3) {
            result.warnings.push('Minimum cash buffer is more than 30% of total budget');
        }
    }
    async validateDistributionConstraints(budget, constraints, campaignDuration, startDate) {
        const compliance = {
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
            compliance.details.channelViolations.push(`Budget total (${budget.total}) exceeds available marketing funds (${constraints.availableMarketingFunds})`);
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
    validateChannelRequirements(allocations, requirements, compliance) {
        requirements.forEach(req => {
            const allocation = allocations.find(alloc => alloc.channel === req.channel);
            if (!allocation) {
                compliance.channelCompliant = false;
                compliance.details.channelViolations.push(`Missing allocation for required channel: ${req.channel}`);
                return;
            }
            if (allocation.amount < req.minAllocation) {
                compliance.channelCompliant = false;
                compliance.details.channelViolations.push(`Channel ${req.channel} allocation (${allocation.amount}) below minimum (${req.minAllocation})`);
            }
            if (allocation.amount > req.maxAllocation) {
                compliance.channelCompliant = false;
                compliance.details.channelViolations.push(`Channel ${req.channel} allocation (${allocation.amount}) exceeds maximum (${req.maxAllocation})`);
            }
            if (req.requiredPercentage && Math.abs(allocation.percentage - req.requiredPercentage) > 1) {
                compliance.channelCompliant = false;
                compliance.details.channelViolations.push(`Channel ${req.channel} percentage (${allocation.percentage}%) differs from required (${req.requiredPercentage}%)`);
            }
        });
    }
    validateDistributionCashFlow(budget, constraints, campaignDuration, compliance) {
        const monthlySpend = budget.total / campaignDuration;
        const dailySpend = monthlySpend / 30;
        if (constraints.maxDailySpend && dailySpend > constraints.maxDailySpend) {
            compliance.cashFlowCompliant = false;
            compliance.details.cashFlowIssues.push(`Projected daily spend (${dailySpend.toFixed(2)}) exceeds limit (${constraints.maxDailySpend})`);
        }
        if (constraints.minimumCashBuffer) {
            const requiredBuffer = budget.total * 0.1; // 10% buffer
            if (constraints.minimumCashBuffer > requiredBuffer) {
                compliance.details.cashFlowIssues.push(`Consider increasing cash buffer to ${constraints.minimumCashBuffer} (currently ${requiredBuffer})`);
            }
        }
    }
    validateSeasonalConstraints(budget, seasonalAdjustments, startDate, campaignDuration, compliance) {
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
                    compliance.details.seasonalWarnings.push(`Month ${month}: Adjusted spend (${adjustedSpend.toFixed(2)}) exceeds maximum (${maxAllowedSpend.toFixed(2)})`);
                }
            }
        }
    }
    validateMinimumSpendRequirements(allocations, requirements, compliance) {
        requirements.forEach(req => {
            const allocation = allocations.find(alloc => alloc.channel === req.channel);
            if (!allocation || allocation.amount < req.minimumAmount) {
                compliance.channelCompliant = false;
                const current = allocation ? allocation.amount : 0;
                compliance.details.channelViolations.push(`Channel ${req.channel} requires minimum ${req.minimumAmount} (current: ${current}) - ${req.reason}`);
            }
        });
    }
    applyDistributionValidationResults(result, compliance) {
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
    generateRecommendations(budget, constraints, result) {
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
    async optimizeBudget(input) {
        const validation = await this.validateBudget(input);
        if (validation.isValid) {
            return input.budget;
        }
        // Create optimized budget based on constraints
        const optimized = { ...input.budget };
        if (input.distributionConstraints) {
            // Adjust total if exceeds available funds
            if (optimized.total > input.distributionConstraints.availableMarketingFunds) {
                optimized.total = input.distributionConstraints.availableMarketingFunds;
            }
            // Optimize channel allocations based on requirements
            if (input.distributionConstraints.channelAllocationRequirements.length > 0) {
                optimized.allocated = this.optimizeChannelAllocations(optimized.total, input.distributionConstraints.channelAllocationRequirements);
            }
        }
        return optimized;
    }
    optimizeChannelAllocations(totalBudget, requirements) {
        const allocations = [];
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
                const additionalAmount = Math.min(remainingBudget * proportion, req.maxAllocation - allocations[index].amount);
                allocations[index].amount += additionalAmount;
                allocations[index].percentage = (allocations[index].amount / totalBudget) * 100;
            });
        }
        return allocations;
    }
}
exports.BudgetService = BudgetService;
// Export singleton instance
exports.budgetService = new BudgetService();
//# sourceMappingURL=budget.js.map