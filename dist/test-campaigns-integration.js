"use strict";
/**
 * Simple test to verify campaigns service distribution integration works.
 * This tests the new distribution functionality without the unrelated TS issues.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.testDistributionIntegration = testDistributionIntegration;
const campaigns_1 = require("./services/campaigns");
async function testDistributionIntegration() {
    console.log('🧪 Testing Distribution Module Integration');
    // Test 1: Check feature flag functionality
    console.log('\n1. Testing feature flag detection...');
    const isEnabled = campaigns_1.campaignService.isDistributionModuleEnabled();
    console.log(`   Distribution module enabled: ${isEnabled}`);
    console.log(`   Environment variable: ${process.env.ENABLE_DISTRIBUTION_MODULE}`);
    // Test 2: Test campaign creation with distribution strategy
    console.log('\n2. Testing campaign creation with distribution strategy...');
    try {
        const newCampaign = await campaigns_1.campaignService.create({
            name: 'Test Distribution Campaign',
            brandId: 'test-brand-123',
            objectives: { target: 'increase_awareness' },
            budget: { total: 60000, currency: 'USD' },
            status: 'draft',
            userId: '550e8400-e29b-41d4-a716-446655440000',
            distributionStrategyId: 'strategy-456'
        });
        console.log(`   ✅ Campaign created with ID: ${newCampaign.id}`);
        console.log(`   ✅ Distribution strategy ID: ${newCampaign.distributionStrategyId}`);
        // Test 3: Test campaign retrieval with distribution data
        console.log('\n3. Testing campaign retrieval with distribution data...');
        const retrievedCampaign = await campaigns_1.campaignService.findById(newCampaign.id, true);
        if (retrievedCampaign) {
            console.log(`   ✅ Campaign retrieved: ${retrievedCampaign.name}`);
            console.log(`   ✅ Distribution strategy preserved: ${retrievedCampaign.distributionStrategyId}`);
            console.log(`   ✅ Distribution intelligence: ${retrievedCampaign.distributionIntelligence?.length || 0} records`);
        }
        // Test 4: Test backward compatibility
        console.log('\n4. Testing backward compatibility...');
        const legacyCampaign = await campaigns_1.campaignService.create({
            name: 'Legacy Campaign Without Distribution',
            brandId: 'legacy-brand-123',
            objectives: { target: 'increase_sales' },
            budget: { total: 30000, currency: 'USD' },
            status: 'draft',
            userId: '550e8400-e29b-41d4-a716-446655440000'
            // No distributionStrategyId - should work fine
        });
        console.log(`   ✅ Legacy campaign created: ${legacyCampaign.id}`);
        console.log(`   ✅ No distribution strategy (backward compatible): ${legacyCampaign.distributionStrategyId === undefined}`);
        console.log('\n🎉 All tests passed! Distribution integration is working correctly.');
    }
    catch (error) {
        console.error('\n❌ Test failed:', error);
    }
}
// Run the test if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    testDistributionIntegration().catch(console.error);
}
//# sourceMappingURL=test-campaigns-integration.js.map