/**
 * ROI Calculator for Campaign Budget Projections
 * Based on industry benchmarks for Google Ads and Meta Ads in Kenya
 */

export interface ROIMetrics {
  impressions: number;
  views: number;
  clicks: number;
  engagement: number;
}

// Exchange rate: 1 USD = 134 KES
const KES_TO_USD_RATE = 134;

// Platform fee: 30% deduction
const PLATFORM_FEE_RATE = 0.3;

/**
 * Platform-specific metrics (based on industry benchmarks)
 */
const PLATFORM_METRICS = {
  'Google Ads': {
    // Google Ads Search/Display benchmarks for real estate
    cpm: 8, // USD per 1000 impressions (average for real estate)
    ctr: 0.025, // 2.5% average CTR
    cpc: 1.5, // USD per click (average for real estate)
    // Views are typically 80-90% of impressions for display ads
    viewRate: 0.85,
    // Engagement (interactions) is typically 0.5-1% of impressions
    engagementRate: 0.0075, // 0.75% engagement rate
  },
  'Meta Ads': {
    // Meta Ads (Facebook/Instagram) benchmarks for real estate
    cpm: 6, // USD per 1000 impressions (average for real estate)
    ctr: 0.015, // 1.5% average CTR
    cpc: 0.8, // USD per click (average for real estate)
    // Views are typically 70-80% of impressions for social ads
    viewRate: 0.75,
    // Engagement (likes, comments, shares) is typically 1-3% of impressions
    engagementRate: 0.02, // 2% engagement rate
  },
};

/**
 * Calculate ROI metrics based on budget and selected platforms
 */
export function calculateROI(budget: number, platforms: string[]): ROIMetrics {
  if (!budget || budget <= 0 || !platforms || platforms.length === 0) {
    return {
      impressions: 0,
      views: 0,
      clicks: 0,
      engagement: 0,
    };
  }

  // Deduct platform fee (30%)
  const adSpend = budget * (1 - PLATFORM_FEE_RATE);
  
  // Convert to USD
  const adSpendUSD = adSpend / KES_TO_USD_RATE;

  let totalImpressions = 0;
  let totalViews = 0;
  let totalClicks = 0;
  let totalEngagement = 0;

  // Calculate metrics for each platform
  platforms.forEach((platform) => {
    const metrics = PLATFORM_METRICS[platform as keyof typeof PLATFORM_METRICS];
    
    if (!metrics) {
      // Default fallback metrics if platform not found
      const defaultMetrics = {
        cpm: 7,
        ctr: 0.02,
        cpc: 1.0,
        viewRate: 0.8,
        engagementRate: 0.015,
      };
      
      // Calculate impressions based on CPM
      const impressions = (adSpendUSD / platforms.length / defaultMetrics.cpm) * 1000;
      totalImpressions += impressions;
      
      // Calculate views (percentage of impressions)
      totalViews += impressions * defaultMetrics.viewRate;
      
      // Calculate clicks based on CTR
      totalClicks += impressions * defaultMetrics.ctr;
      
      // Calculate engagement
      totalEngagement += impressions * defaultMetrics.engagementRate;
    } else {
      // Calculate impressions based on CPM
      // CPM = Cost per 1000 impressions
      // Impressions = (Budget / CPM) * 1000
      const platformBudgetUSD = adSpendUSD / platforms.length;
      const impressions = (platformBudgetUSD / metrics.cpm) * 1000;
      totalImpressions += impressions;
      
      // Calculate views (percentage of impressions that are actually viewed)
      totalViews += impressions * metrics.viewRate;
      
      // Calculate clicks based on CTR (Click-Through Rate)
      totalClicks += impressions * metrics.ctr;
      
      // Calculate engagement (likes, comments, shares, etc.)
      totalEngagement += impressions * metrics.engagementRate;
    }
  });

  return {
    impressions: Math.round(totalImpressions),
    views: Math.round(totalViews),
    clicks: Math.round(totalClicks),
    engagement: Math.round(totalEngagement),
  };
}

/**
 * Generate ROI projection data points for graphing
 */
export function generateROIProjection(
  minBudget: number,
  maxBudget: number,
  platforms: string[],
  steps: number = 30
): Array<{ budget: number; impressions: number }> {
  if (!platforms || platforms.length === 0) {
    return [];
  }

  const data: Array<{ budget: number; impressions: number }> = [];
  const budgetStep = (maxBudget - minBudget) / steps;

  for (let i = 0; i <= steps; i++) {
    const budget = Math.round(minBudget + budgetStep * i);
    const metrics = calculateROI(budget, platforms);
    data.push({
      budget,
      impressions: metrics.impressions,
    });
  }

  return data;
}

/**
 * Format large numbers for display (e.g., 1.5K, 2.3M)
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

