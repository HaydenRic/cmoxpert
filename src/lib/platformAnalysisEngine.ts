interface PlatformAnalysisInput {
  monthly_ad_spend: number;
  primary_channels: string[];
  biggest_challenge: string;
  industry?: string;
  tracking_setup?: boolean;
  current_roas?: number;
}

interface PlatformDetail {
  platform: string;
  score: number;
  issues: string[];
  recommendations: string[];
  waste_indicators: string[];
  best_practices: string[];
}

interface PlatformAnalysis {
  overall_score: number;
  campaign_structure: number;
  tracking_analytics: number;
  budget_allocation: number;
  best_practices: number;
  platform_details: PlatformDetail[];
}

export function analyzePlatforms(input: PlatformAnalysisInput): PlatformAnalysis {
  const spend = input.monthly_ad_spend / 100;
  const channelCount = input.primary_channels.length;

  let campaign_structure = 70;
  let tracking_analytics = 60;
  let budget_allocation = 65;
  let best_practices = 60;

  if (channelCount === 1) {
    campaign_structure -= 20;
  } else if (channelCount > 5) {
    campaign_structure -= 15;
  }

  if (spend > 100000) {
    budget_allocation -= 15;
  }

  if (input.biggest_challenge.toLowerCase().includes('track')) {
    tracking_analytics -= 20;
  }

  if (!input.tracking_setup) {
    tracking_analytics -= 25;
  }

  if (input.current_roas && input.current_roas < 2) {
    best_practices -= 20;
  }

  const platform_details: PlatformDetail[] = [];

  if (input.primary_channels.includes('paid_search')) {
    const googleScore = calculateGoogleAdsScore(spend, input);
    platform_details.push({
      platform: 'Google Ads / Paid Search',
      score: googleScore,
      issues: getGoogleAdsIssues(spend, input),
      recommendations: getGoogleAdsRecommendations(spend, input),
      waste_indicators: [
        'High CPC campaigns with low conversion rates',
        'Broad match keywords without negative lists',
        'Ad groups with single keywords or 20+ keywords',
        'Search terms report not reviewed weekly',
        'Quality Score below 7 on main keywords'
      ],
      best_practices: [
        'Implement Smart Bidding (Target CPA or Target ROAS)',
        'Use all relevant ad extensions (Sitelinks, Callouts, Structured Snippets)',
        'Set up conversion tracking with enhanced conversions',
        'Create shared negative keyword lists',
        'Maintain Quality Score above 7 for profitable keywords'
      ]
    });
  }

  if (input.primary_channels.includes('paid_social')) {
    const facebookScore = calculateFacebookAdsScore(spend, input);
    platform_details.push({
      platform: 'Facebook / Instagram Ads',
      score: facebookScore,
      issues: getFacebookAdsIssues(spend, input),
      recommendations: getFacebookAdsRecommendations(spend, input),
      waste_indicators: [
        'Overlapping custom audiences causing auction competition',
        'Ad creative not refreshed in 60+ days (creative fatigue)',
        'Audience sizes below 50k or above 5M',
        'Frequency above 3 without creative refresh',
        'Not using Conversion API alongside Pixel'
      ],
      best_practices: [
        'Implement Conversion API for accurate tracking (iOS 14.5+)',
        'Use Campaign Budget Optimization (CBO)',
        'Test 3-5 creatives per ad set minimum',
        'Refresh creatives every 30-45 days',
        'Exclude converters from prospecting campaigns'
      ]
    });
  }

  if (input.primary_channels.includes('linkedin')) {
    const linkedinScore = calculateLinkedInAdsScore(spend, input);
    platform_details.push({
      platform: 'LinkedIn Ads',
      score: linkedinScore,
      issues: getLinkedInIssues(spend, input),
      recommendations: getLinkedInRecommendations(spend, input),
      waste_indicators: [
        'Audience too narrow (<50k) driving up CPCs',
        'Not leveraging Matched Audiences (retargeting)',
        'Single image ads only (missing video/carousel)',
        'No lead gen forms (sending to website)',
        'Bidding too low causing limited delivery'
      ],
      best_practices: [
        'Use LinkedIn Lead Gen Forms to reduce friction',
        'Create Matched Audiences from CRM lists and website visitors',
        'Test video content (typically 2-3x better engagement)',
        'Maintain audience size 50k-500k for optimal performance',
        'Use Conversation Ads for direct engagement'
      ]
    });
  }

  if (input.primary_channels.includes('display')) {
    platform_details.push({
      platform: 'Display Advertising',
      score: 55,
      issues: [
        'Display campaigns often have high impression waste',
        'Limited ability to verify ad placement quality',
        'Lower intent audiences compared to search'
      ],
      recommendations: [
        'Focus display on retargeting rather than prospecting',
        'Use placement exclusions aggressively',
        'Implement frequency caps (3-5 per week)',
        'Test responsive display ads with multiple asset variations'
      ],
      waste_indicators: [
        'Running display as prospecting without brand awareness KPIs',
        'No frequency capping (showing ads 10+ times)',
        'Automatic placements without exclusions',
        'Image ads only (not testing responsive formats)'
      ],
      best_practices: [
        'Use Customer Match audiences for display retargeting',
        'Exclude mobile apps and low-quality placements',
        'Set frequency caps at 3-5 impressions per user per week',
        'Create custom intent audiences based on keywords'
      ]
    });
  }

  const overall_score = Math.round(
    (campaign_structure + tracking_analytics + budget_allocation + best_practices) / 4
  );

  return {
    overall_score,
    campaign_structure,
    tracking_analytics,
    budget_allocation,
    best_practices,
    platform_details
  };
}

function calculateGoogleAdsScore(spend: number, input: PlatformAnalysisInput): number {
  let score = 70;

  if (spend > 50000) score -= 10;
  if (!input.tracking_setup) score -= 20;
  if (input.biggest_challenge.toLowerCase().includes('expensive')) score -= 15;

  return Math.max(30, Math.min(score, 90));
}

function getGoogleAdsIssues(spend: number, input: PlatformAnalysisInput): string[] {
  const issues = [
    'Likely missing Smart Bidding implementation',
    'Search terms report probably not reviewed weekly'
  ];

  if (!input.tracking_setup) {
    issues.push('Conversion tracking not properly configured');
  }

  if (spend > 50000) {
    issues.push('High spend without systematic optimization');
  }

  return issues;
}

function getGoogleAdsRecommendations(spend: number, input: PlatformAnalysisInput): string[] {
  return [
    'Implement Target CPA or Target ROAS bidding',
    'Set up weekly search terms report review process',
    'Add all relevant ad extensions',
    'Create shared negative keyword lists',
    'Audit Quality Scores and improve low-scoring keywords'
  ];
}

function calculateFacebookAdsScore(spend: number, input: PlatformAnalysisInput): number {
  let score = 65;

  if (!input.tracking_setup) score -= 25;
  if (spend > 30000) score -= 10;

  return Math.max(30, Math.min(score, 85));
}

function getFacebookAdsIssues(spend: number, input: PlatformAnalysisInput): string[] {
  const issues = ['Creative fatigue reducing performance over time'];

  if (!input.tracking_setup) {
    issues.push('Missing Conversion API implementation (critical for iOS 14.5+)');
  }

  issues.push('Potential audience overlap causing wasted spend');

  return issues;
}

function getFacebookAdsRecommendations(spend: number, input: PlatformAnalysisInput): string[] {
  return [
    'Implement Conversion API alongside Pixel',
    'Set up creative testing framework (3-5 variants per ad set)',
    'Refresh creatives every 30-45 days',
    'Use audience exclusions to prevent overlap',
    'Enable Campaign Budget Optimization (CBO)'
  ];
}

function calculateLinkedInAdsScore(spend: number, input: PlatformAnalysisInput): number {
  let score = 60;

  if (spend < 10000) score += 10;
  if (!input.tracking_setup) score -= 15;

  return Math.max(35, Math.min(score, 80));
}

function getLinkedInIssues(spend: number, input: PlatformAnalysisInput): string[] {
  return [
    'High CPCs typical on LinkedIn require tight targeting',
    'Likely not using Lead Gen Forms (higher conversion rates)',
    'Missing retargeting with Matched Audiences'
  ];
}

function getLinkedInRecommendations(spend: number, input: PlatformAnalysisInput): string[] {
  return [
    'Switch to Lead Gen Forms for direct lead capture',
    'Create Matched Audiences from CRM and website visitors',
    'Test video content (better engagement than images)',
    'Maintain audience sizes between 50k-500k',
    'Use Conversation Ads for higher engagement'
  ];
}
