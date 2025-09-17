-- Materialized Views for Distribution Performance Optimization

-- 1. Campaign Distribution Summary View
-- Pre-aggregates common campaign metrics for fast dashboard loading
CREATE MATERIALIZED VIEW distribution_campaign_summary AS
SELECT 
    c.id as campaign_id,
    c.name as campaign_name,
    c.status as campaign_status,
    c."brandId" as brand_id,
    ds.id as session_id,
    ds."currentScenario" as current_scenario,
    ds."presentationMode" as presentation_mode,
    ds."lastSaved" as last_saved,
    ds."hasUnsavedChanges" as has_unsaved_changes,
    COUNT(dsc.id) as scenario_count,
    COUNT(CASE WHEN dsc."isBaseline" = true THEN 1 END) as baseline_scenarios,
    MAX(dsc."lastModified") as last_scenario_update,
    COUNT(dc.id) as total_changes,
    c."createdAt" as created_at,
    c."updatedAt" as updated_at
FROM "Campaign" c
LEFT JOIN "DistributionSession" ds ON c.id = ds."campaignId"
LEFT JOIN "DistributionScenario" dsc ON ds.id = dsc."sessionId"
LEFT JOIN "DistributionChange" dc ON dsc.id = dc."scenarioId"
GROUP BY c.id, c.name, c.status, c."brandId", ds.id, ds."currentScenario", 
         ds."presentationMode", ds."lastSaved", ds."hasUnsavedChanges", c."createdAt", c."updatedAt";

-- 2. Scenario Performance Summary View
-- Pre-calculates projection metrics for fast comparison
CREATE MATERIALIZED VIEW distribution_scenario_performance AS
SELECT 
    dsc.id as scenario_id,
    dsc."sessionId" as session_id,
    dsc.name as scenario_name,
    dsc."isBaseline" as is_baseline,
    dsc.parameters,
    dsc.projections,
    -- Extract key metrics from JSON for fast querying
    (dsc.projections->>'year1Revenue')::numeric as year1_revenue,
    (dsc.projections->>'year1Volume')::numeric as year1_volume,
    (dsc.projections->>'year1Profit')::numeric as year1_profit,
    (dsc.projections->>'roi')::numeric as roi,
    (dsc.projections->>'breakEvenMonths')::numeric as break_even_months,
    (dsc.projections->>'riskScore')::numeric as risk_score,
    -- Parameter extractions for filtering
    (dsc.parameters->>'msrp')::numeric as msrp,
    (dsc.parameters->>'distributorMargin')::numeric as distributor_margin,
    (dsc.parameters->>'retailerMargin')::numeric as retailer_margin,
    (dsc.parameters->>'volumeCommitment')::numeric as volume_commitment,
    (dsc.parameters->>'marketingSpend')::numeric as marketing_spend,
    (dsc.parameters->>'seasonalAdjustment')::numeric as seasonal_adjustment,
    dsc."lastModified" as last_modified,
    dsc."createdAt" as created_at
FROM "DistributionScenario" dsc;

-- 3. User Activity Summary View
-- Tracks user engagement with distribution modeling
CREATE MATERIALIZED VIEW distribution_user_activity AS
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    COUNT(DISTINCT ds."campaignId") as campaigns_accessed,
    COUNT(DISTINCT ds.id) as sessions_created,
    COUNT(dc.id) as total_changes_made,
    MAX(dc.timestamp) as last_activity,
    MIN(dc.timestamp) as first_activity,
    COUNT(dc.id) FILTER (WHERE dc.timestamp >= NOW() - INTERVAL '7 days') as changes_last_7_days,
    COUNT(dc.id) FILTER (WHERE dc.timestamp >= NOW() - INTERVAL '30 days') as changes_last_30_days,
    -- Most active time of day (hour)
    MODE() WITHIN GROUP (ORDER BY EXTRACT(hour FROM dc.timestamp)) as most_active_hour
FROM "User" u
LEFT JOIN "Campaign" c ON u.id = c."userId"
LEFT JOIN "DistributionSession" ds ON c.id = ds."campaignId"
LEFT JOIN "DistributionScenario" dsc ON ds.id = dsc."sessionId"
LEFT JOIN "DistributionChange" dc ON dsc.id = dc."scenarioId"
GROUP BY u.id, u.email, u.name;

-- 4. Change Pattern Analysis View
-- Identifies common parameter change patterns for optimization
CREATE MATERIALIZED VIEW distribution_change_patterns AS
SELECT 
    dc.field,
    COUNT(*) as change_frequency,
    AVG((dc."newValue"#>>ARRAY[]::text[])::numeric) FILTER (WHERE jsonb_typeof(dc."newValue") = 'number') as avg_new_value,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY (dc."newValue"#>>ARRAY[]::text[])::numeric) 
        FILTER (WHERE jsonb_typeof(dc."newValue") = 'number') as median_new_value,
    MIN(dc.timestamp) as first_seen,
    MAX(dc.timestamp) as last_seen,
    COUNT(DISTINCT dc."scenarioId") as scenarios_affected,
    COUNT(DISTINCT dc."userId") as users_making_changes,
    -- Time-based patterns
    COUNT(*) FILTER (WHERE EXTRACT(hour FROM dc.timestamp) BETWEEN 9 AND 17) as business_hours_changes,
    COUNT(*) FILTER (WHERE EXTRACT(dow FROM dc.timestamp) IN (1,2,3,4,5)) as weekday_changes
FROM "DistributionChange" dc
WHERE dc.timestamp >= NOW() - INTERVAL '90 days'
GROUP BY dc.field;

-- 5. Performance Metrics View
-- Real-time performance monitoring for optimization
CREATE MATERIALIZED VIEW distribution_performance_metrics AS
SELECT 
    'overall' as metric_scope,
    COUNT(DISTINCT ds.id) as active_sessions,
    COUNT(DISTINCT dsc.id) as total_scenarios,
    COUNT(dc.id) as total_changes_today,
    AVG(EXTRACT(epoch FROM (dsc."lastModified" - dsc."createdAt"))) as avg_scenario_lifetime_seconds,
    COUNT(*) FILTER (WHERE ds."hasUnsavedChanges" = true) as sessions_with_unsaved_changes,
    COUNT(*) FILTER (WHERE ds."presentationMode" = true) as sessions_in_presentation_mode,
    NOW() as calculated_at
FROM "DistributionSession" ds
LEFT JOIN "DistributionScenario" dsc ON ds.id = dsc."sessionId"
LEFT JOIN "DistributionChange" dc ON dsc.id = dc."scenarioId" AND dc.timestamp::date = CURRENT_DATE;

-- Create indexes on materialized views for faster querying
CREATE INDEX idx_distribution_campaign_summary_campaign_id ON distribution_campaign_summary(campaign_id);
CREATE INDEX idx_distribution_campaign_summary_status ON distribution_campaign_summary(campaign_status);
CREATE INDEX idx_distribution_campaign_summary_brand ON distribution_campaign_summary(brand_id);

CREATE INDEX idx_distribution_scenario_performance_session ON distribution_scenario_performance(session_id);
CREATE INDEX idx_distribution_scenario_performance_baseline ON distribution_scenario_performance(is_baseline);
CREATE INDEX idx_distribution_scenario_performance_roi ON distribution_scenario_performance(roi DESC);
CREATE INDEX idx_distribution_scenario_performance_risk ON distribution_scenario_performance(risk_score);

CREATE INDEX idx_distribution_user_activity_user ON distribution_user_activity(user_id);
CREATE INDEX idx_distribution_user_activity_last_activity ON distribution_user_activity(last_activity DESC);

CREATE INDEX idx_distribution_change_patterns_field ON distribution_change_patterns(field);
CREATE INDEX idx_distribution_change_patterns_frequency ON distribution_change_patterns(change_frequency DESC);

-- Set up refresh schedule for materialized views
-- Campaign summary: Refresh every 5 minutes (for dashboards)
-- Scenario performance: Refresh every 2 minutes (for live updates)
-- User activity: Refresh every 15 minutes
-- Change patterns: Refresh every hour
-- Performance metrics: Refresh every minute