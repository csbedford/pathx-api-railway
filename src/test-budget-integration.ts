/**
 * Integration test for budget service with and without distribution constraints.
 * Tests budget validation, optimization, and constraint compliance.
 */

import { budgetService, type IBudget, type IDistributionConstraints, type IBudgetValidationInput } from './services/budget';

async function testBudgetService() {
  console.log('🧪 Testing Budget Service Integration');
  
  try {
    // Test 1: Basic budget validation without distribution constraints
    console.log('\n1. Testing basic budget validation...');
    await testBasicBudgetValidation();
    
    // Test 2: Budget validation with distribution constraints
    console.log('\n2. Testing budget validation with distribution constraints...');
    await testBudgetWithDistributionConstraints();
    
    // Test 3: Budget optimization
    console.log('\n3. Testing budget optimization...');
    await testBudgetOptimization();
    
    // Test 4: Channel allocation validation
    console.log('\n4. Testing channel allocation validation...');
    await testChannelAllocationValidation();
    
    // Test 5: Cash flow constraints validation
    console.log('\n5. Testing cash flow constraints validation...');
    await testCashFlowValidation();
    
    // Test 6: Seasonal constraints validation
    console.log('\n6. Testing seasonal constraints validation...');
    await testSeasonalValidation();
    
    console.log('\n🎉 All budget service tests passed!');
    
  } catch (error) {
    console.error('\n❌ Budget service test failed:', error);
  }
}

async function testBasicBudgetValidation() {
  // Valid budget without distribution constraints
  const validBudget: IBudget = {
    total: 100000,
    currency: 'USD',
    spent: 0,
    allocated: [
      { channel: 'Google Ads', amount: 50000, percentage: 50 },
      { channel: 'Facebook Ads', amount: 30000, percentage: 30 },
      { channel: 'Display', amount: 20000, percentage: 20 }
    ],
    constraints: {
      maxMonthlySpend: 15000,
      minReserve: 10000,
      cashFlowConstraints: {
        maxDailySpend: 1000,
        paymentTermsDays: 30,
        minimumCashBuffer: 5000
      }
    }
  };

  const input: IBudgetValidationInput = {
    budget: validBudget,
    campaignDuration: 12
  };

  const result = await budgetService.validateBudget(input);
  
  console.log(`   ✅ Valid budget validation result: ${result.isValid ? 'PASSED' : 'FAILED'}`);
  console.log(`   ✅ Errors: ${result.errors.length}`);
  console.log(`   ✅ Warnings: ${result.warnings.length}`);
  console.log(`   ✅ Recommendations: ${result.recommendations.length}`);

  // Invalid budget test
  const invalidBudget: IBudget = {
    total: -1000, // Invalid negative amount
    currency: 'XX', // Invalid currency
    spent: 2000, // Spent more than total
    allocated: [
      { channel: 'Google Ads', amount: 60000, percentage: 60 },
      { channel: 'Facebook Ads', amount: 50000, percentage: 50 } // Total exceeds budget
    ]
  };

  const invalidInput: IBudgetValidationInput = {
    budget: invalidBudget,
    campaignDuration: 12
  };

  const invalidResult = await budgetService.validateBudget(invalidInput);
  
  console.log(`   ✅ Invalid budget validation result: ${!invalidResult.isValid ? 'PASSED' : 'FAILED'}`);
  console.log(`   ✅ Detected ${invalidResult.errors.length} errors as expected`);
}

async function testBudgetWithDistributionConstraints() {
  const budget: IBudget = {
    total: 150000,
    currency: 'USD',
    allocated: [
      { channel: 'Google Ads', amount: 75000, percentage: 50 },
      { channel: 'Facebook Ads', amount: 45000, percentage: 30 },
      { channel: 'Display', amount: 30000, percentage: 20 }
    ]
  };

  const distributionConstraints: IDistributionConstraints = {
    availableMarketingFunds: 200000,
    channelAllocationRequirements: [
      { channel: 'Google Ads', minAllocation: 50000, maxAllocation: 100000, requiredPercentage: 50 },
      { channel: 'Facebook Ads', minAllocation: 30000, maxAllocation: 80000 },
      { channel: 'Display', minAllocation: 20000, maxAllocation: 50000 }
    ],
    cashFlowConstraints: {
      maxDailySpend: 2000,
      paymentTermsDays: 30,
      minimumCashBuffer: 15000
    },
    seasonalAdjustments: [
      { month: 11, adjustmentFactor: 1.5, maxSpendMultiplier: 2.0 }, // November (holiday season)
      { month: 12, adjustmentFactor: 1.8, maxSpendMultiplier: 2.5 }  // December (peak holiday)
    ],
    minimumSpendRequirements: [
      { channel: 'Google Ads', minimumAmount: 40000, reason: 'Brand awareness requirements' }
    ]
  };

  const input: IBudgetValidationInput = {
    budget,
    distributionConstraints,
    campaignDuration: 12,
    startDate: new Date('2024-01-01')
  };

  const result = await budgetService.validateBudget(input);
  
  console.log(`   ✅ Budget with distribution constraints validation: ${result.isValid ? 'PASSED' : 'FAILED'}`);
  console.log(`   ✅ Distribution compliance available: ${result.distributionCompliance ? 'YES' : 'NO'}`);
  
  if (result.distributionCompliance) {
    const compliance = result.distributionCompliance;
    console.log(`   ✅ Funds compliant: ${compliance.fundsCompliant}`);
    console.log(`   ✅ Channel compliant: ${compliance.channelCompliant}`);
    console.log(`   ✅ Cash flow compliant: ${compliance.cashFlowCompliant}`);
    console.log(`   ✅ Seasonal compliant: ${compliance.seasonalCompliant}`);
    console.log(`   ✅ Available funds: ${compliance.details.availableFunds}`);
    console.log(`   ✅ Requested amount: ${compliance.details.requestedAmount}`);
  }

  console.log(`   ✅ Errors: ${result.errors.length}`);
  console.log(`   ✅ Warnings: ${result.warnings.length}`);
  console.log(`   ✅ Recommendations: ${result.recommendations.length}`);
}

async function testBudgetOptimization() {
  // Budget that exceeds available funds
  const budget: IBudget = {
    total: 250000, // Exceeds available funds
    currency: 'USD'
  };

  const distributionConstraints: IDistributionConstraints = {
    availableMarketingFunds: 200000, // Less than requested
    channelAllocationRequirements: [
      { channel: 'Google Ads', minAllocation: 80000, maxAllocation: 120000 },
      { channel: 'Facebook Ads', minAllocation: 60000, maxAllocation: 100000 },
      { channel: 'Display', minAllocation: 40000, maxAllocation: 60000 }
    ],
    cashFlowConstraints: {
      maxDailySpend: 3000,
      minimumCashBuffer: 20000
    }
  };

  const input: IBudgetValidationInput = {
    budget,
    distributionConstraints,
    campaignDuration: 12
  };

  const optimizedBudget = await budgetService.optimizeBudget(input);
  
  console.log(`   ✅ Original budget total: ${budget.total}`);
  console.log(`   ✅ Optimized budget total: ${optimizedBudget.total}`);
  console.log(`   ✅ Budget reduced to fit constraints: ${optimizedBudget.total <= distributionConstraints.availableMarketingFunds ? 'YES' : 'NO'}`);
  console.log(`   ✅ Channel allocations generated: ${optimizedBudget.allocated ? optimizedBudget.allocated.length : 0}`);
  
  if (optimizedBudget.allocated) {
    optimizedBudget.allocated.forEach(alloc => {
      console.log(`   ✅ ${alloc.channel}: ${alloc.amount} (${alloc.percentage.toFixed(1)}%)`);
    });
  }
}

async function testChannelAllocationValidation() {
  const budget: IBudget = {
    total: 100000,
    currency: 'USD',
    allocated: [
      { channel: 'Google Ads', amount: 20000, percentage: 20 }, // Below minimum
      { channel: 'Facebook Ads', amount: 120000, percentage: 120 }, // Exceeds maximum and percentage over 100
      // Missing required Display channel
    ]
  };

  const distributionConstraints: IDistributionConstraints = {
    availableMarketingFunds: 150000,
    channelAllocationRequirements: [
      { channel: 'Google Ads', minAllocation: 30000, maxAllocation: 80000 },
      { channel: 'Facebook Ads', minAllocation: 25000, maxAllocation: 100000 },
      { channel: 'Display', minAllocation: 15000, maxAllocation: 40000 } // Required but missing
    ],
    cashFlowConstraints: {
      maxDailySpend: 1500
    }
  };

  const input: IBudgetValidationInput = {
    budget,
    distributionConstraints,
    campaignDuration: 12
  };

  const result = await budgetService.validateBudget(input);
  
  console.log(`   ✅ Channel validation detected violations: ${!result.isValid ? 'YES' : 'NO'}`);
  console.log(`   ✅ Number of errors found: ${result.errors.length}`);
  
  if (result.distributionCompliance) {
    console.log(`   ✅ Channel compliant: ${result.distributionCompliance.channelCompliant ? 'NO (as expected)' : 'NO (correct)'}`);
    console.log(`   ✅ Channel violations: ${result.distributionCompliance.details.channelViolations.length}`);
    result.distributionCompliance.details.channelViolations.forEach(violation => {
      console.log(`   ⚠️  ${violation}`);
    });
  }
}

async function testCashFlowValidation() {
  const budget: IBudget = {
    total: 120000, // $10k per month
    currency: 'USD',
    constraints: {
      cashFlowConstraints: {
        maxDailySpend: 200, // Very low daily limit
        minimumCashBuffer: 50000 // Very high buffer requirement
      }
    }
  };

  const distributionConstraints: IDistributionConstraints = {
    availableMarketingFunds: 150000,
    channelAllocationRequirements: [],
    cashFlowConstraints: {
      maxDailySpend: 250, // Even lower than budget constraint
      paymentTermsDays: 45,
      minimumCashBuffer: 30000
    }
  };

  const input: IBudgetValidationInput = {
    budget,
    distributionConstraints,
    campaignDuration: 12
  };

  const result = await budgetService.validateBudget(input);
  
  console.log(`   ✅ Cash flow validation result: ${result.isValid ? 'PASSED' : 'FAILED (expected)'}`);
  
  if (result.distributionCompliance) {
    console.log(`   ✅ Cash flow compliant: ${result.distributionCompliance.cashFlowCompliant}`);
    console.log(`   ✅ Cash flow issues detected: ${result.distributionCompliance.details.cashFlowIssues.length}`);
    result.distributionCompliance.details.cashFlowIssues.forEach(issue => {
      console.log(`   ⚠️  ${issue}`);
    });
  }
  
  console.log(`   ✅ Warnings generated: ${result.warnings.length}`);
  result.warnings.forEach(warning => {
    console.log(`   ⚠️  ${warning}`);
  });
}

async function testSeasonalValidation() {
  const budget: IBudget = {
    total: 120000, // $10k per month baseline
    currency: 'USD'
  };

  const distributionConstraints: IDistributionConstraints = {
    availableMarketingFunds: 150000,
    channelAllocationRequirements: [],
    cashFlowConstraints: {
      maxDailySpend: 1000
    },
    seasonalAdjustments: [
      { month: 11, adjustmentFactor: 2.5, maxSpendMultiplier: 2.0 }, // High adjustment that exceeds max
      { month: 12, adjustmentFactor: 3.0, maxSpendMultiplier: 2.5 }  // Very high holiday spending
    ]
  };

  const input: IBudgetValidationInput = {
    budget,
    distributionConstraints,
    campaignDuration: 12,
    startDate: new Date('2024-01-01') // Will hit November and December adjustments
  };

  const result = await budgetService.validateBudget(input);
  
  console.log(`   ✅ Seasonal validation result: ${result.isValid ? 'PASSED' : 'FAILED'}`);
  
  if (result.distributionCompliance) {
    console.log(`   ✅ Seasonal compliant: ${result.distributionCompliance.seasonalCompliant}`);
    console.log(`   ✅ Seasonal warnings: ${result.distributionCompliance.details.seasonalWarnings.length}`);
    result.distributionCompliance.details.seasonalWarnings.forEach(warning => {
      console.log(`   ⚠️  ${warning}`);
    });
  }
  
  console.log(`   ✅ Overall warnings: ${result.warnings.length}`);
}

// Run the test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testBudgetService().catch(console.error);
}

export { testBudgetService };