interface ActionPlanInput {
  monthly_ad_spend: number;
  primary_channels: string[];
  biggest_challenge: string;
  score: number;
  tracking_setup?: boolean;
  current_roas?: number;
}

export interface ActionPlanItem {
  title: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  impact: 'High' | 'Medium' | 'Low';
  effort: number;
  timeline: string;
  steps: string[];
  expected_result: string;
  category: string;
}

export function generateActionPlan(input: ActionPlanInput): ActionPlanItem[] {
  const actions: ActionPlanItem[] = [];
  const spend = input.monthly_ad_spend / 100;

  if (!input.tracking_setup || input.biggest_challenge.toLowerCase().includes('track')) {
    actions.push({
      title: 'Implement Comprehensive Conversion Tracking',
      priority: 'HIGH',
      impact: 'High',
      effort: 3,
      timeline: '1-2 weeks',
      steps: [
        'Audit all current conversion tracking implementations',
        'Set up Google Tag Manager for centralized tag management',
        'Implement conversion tracking on all key actions (form submits, purchases, calls)',
        'Add event tracking for micro-conversions (scroll depth, video views, etc.)',
        'Test all tracking in preview mode before publishing',
        'Set up conversion value tracking if running ecommerce'
      ],
      expected_result: 'Accurate attribution data enabling informed budget decisions. Typically reveals 15-20% of conversions were previously untracked.',
      category: 'Tracking & Analytics'
    });
  }

  if (input.primary_channels.includes('paid_search')) {
    actions.push({
      title: 'Implement Negative Keyword Strategy',
      priority: 'HIGH',
      impact: 'High',
      effort: 2,
      timeline: '3-5 days',
      steps: [
        'Export Search Terms Report for last 90 days',
        'Identify irrelevant queries generating clicks but no conversions',
        'Create shared negative keyword list with 50-100 terms',
        'Apply negative list to all search campaigns',
        'Set up weekly review process to continually add negatives',
        'Monitor for 7 days and measure cost savings'
      ],
      expected_result: '10-15% reduction in wasted search spend. Improved click-through rate and Quality Score.',
      category: 'Google Ads Optimization'
    });

    actions.push({
      title: 'Transition to Smart Bidding',
      priority: 'HIGH',
      impact: 'High',
      effort: 2,
      timeline: '1 week',
      steps: [
        'Ensure conversion tracking has 30+ conversions in last 30 days',
        'Start with highest-volume campaign',
        'Switch from Manual CPC to Target CPA bidding',
        'Set initial Target CPA 10-20% higher than current CPA',
        'Allow 2-week learning period without changes',
        'Monitor performance and adjust targets incrementally',
        'Roll out to additional campaigns if successful'
      ],
      expected_result: '12-18% improvement in conversion rate. Reduced time spent on manual bid adjustments.',
      category: 'Google Ads Optimization'
    });
  }

  if (input.primary_channels.includes('paid_social')) {
    actions.push({
      title: 'Implement Facebook Conversion API',
      priority: 'HIGH',
      impact: 'High',
      effort: 4,
      timeline: '1-2 weeks',
      steps: [
        'Set up server-side tracking via Conversion API',
        'Connect your website backend to Facebook Events Manager',
        'Configure key events (PageView, AddToCart, Purchase, Lead)',
        'Enable Event Match Quality monitoring',
        'Test events using Facebook Event Testing tool',
        'Run dual tracking (Pixel + CAPI) for maximum accuracy'
      ],
      expected_result: '25-40% improvement in conversion tracking accuracy post iOS 14.5. Better campaign optimization.',
      category: 'Meta Ads Optimization'
    });

    actions.push({
      title: 'Establish Creative Refresh Cadence',
      priority: 'MEDIUM',
      impact: 'High',
      effort: 3,
      timeline: '2-3 weeks',
      steps: [
        'Audit current ad creative performance and frequency metrics',
        'Identify ads with frequency >3 and declining performance',
        'Create 3-5 new creative variations per ad set',
        'Test different hooks, formats (video, carousel, static), and CTAs',
        'Set calendar reminder for creative refresh every 30-45 days',
        'Archive underperforming creatives and scale winners'
      ],
      expected_result: '20-30% improvement in click-through rate. Reduced cost per acquisition as creative fatigue eliminated.',
      category: 'Meta Ads Optimization'
    });
  }

  if (input.primary_channels.includes('linkedin')) {
    actions.push({
      title: 'Switch to LinkedIn Lead Gen Forms',
      priority: 'MEDIUM',
      impact: 'High',
      effort: 2,
      timeline: '1 week',
      steps: [
        'Create Lead Gen Form in Campaign Manager',
        'Keep form fields minimal (name, email, company max)',
        'Add privacy policy and custom thank you message',
        'Set up lead sync to CRM or email notifications',
        'Convert existing campaigns to use Lead Gen Forms',
        'Compare conversion rates vs landing page'
      ],
      expected_result: '50-100% increase in conversion rate. Leads submitted directly on LinkedIn vs multi-step landing page.',
      category: 'LinkedIn Ads Optimization'
    });
  }

  if (spend > 50000) {
    actions.push({
      title: 'Implement Multi-Touch Attribution Modeling',
      priority: 'MEDIUM',
      impact: 'High',
      effort: 4,
      timeline: '2-4 weeks',
      steps: [
        'Select attribution modeling tool (Google Analytics 4, HubSpot, etc)',
        'Map full customer journey across all touchpoints',
        'Set up UTM parameter consistency across all channels',
        'Configure attribution windows (7-day, 30-day, 90-day)',
        'Run attribution report comparing last-click vs multi-touch',
        'Identify undervalued channels receiving assist credit'
      ],
      expected_result: 'Accurate channel value attribution. Typically reveals 20-30% of conversions involve multiple touchpoints.',
      category: 'Tracking & Analytics'
    });
  }

  actions.push({
    title: 'Optimize Landing Page Conversion Rates',
    priority: 'MEDIUM',
    impact: 'High',
    effort: 3,
    timeline: '2-3 weeks',
    steps: [
      'Audit current landing page conversion rates',
      'Identify highest-traffic landing pages',
      'Implement heat mapping tool (Hotjar, Microsoft Clarity)',
      'Analyze user behavior and identify friction points',
      'Create variant with single clear CTA and reduced form fields',
      'Run A/B test for 2 weeks with minimum 100 conversions per variant'
    ],
    expected_result: '15-30% improvement in landing page conversion rate. Same traffic, more conversions.',
    category: 'Conversion Optimization'
  });

  actions.push({
    title: 'Eliminate Underperforming Campaigns',
    priority: 'HIGH',
    impact: 'Medium',
    effort: 1,
    timeline: '2-3 days',
    steps: [
      'Export campaign performance data for last 90 days',
      'Calculate CPA or ROAS for each campaign',
      'Identify campaigns 50%+ above target CPA or below target ROAS',
      'Pause worst performing 20% of campaigns',
      'Reallocate budget to top-performing campaigns',
      'Monitor aggregate performance for 7 days'
    ],
    expected_result: '15-25% immediate reduction in wasted spend. Focus resources on what works.',
    category: 'Budget Optimization'
  });

  if (input.primary_channels.length > 4) {
    actions.push({
      title: 'Consolidate to Top-Performing Channels',
      priority: 'MEDIUM',
      impact: 'Medium',
      effort: 3,
      timeline: '2-3 weeks',
      steps: [
        'Calculate full-funnel ROI by channel (including attribution)',
        'Rank channels by efficiency (CPA, ROAS, LTV)',
        'Identify bottom 2 channels for reduction or elimination',
        'Gradually shift budget to top 3 performers (10% per week)',
        'Monitor for 30 days to ensure no negative impact',
        'Reinvest savings into scaling top channels'
      ],
      expected_result: '18-25% improvement in overall marketing efficiency. Achieve economies of scale in best channels.',
      category: 'Budget Optimization'
    });
  }

  actions.push({
    title: 'Set Up Automated Performance Reporting',
    priority: 'LOW',
    impact: 'Medium',
    effort: 3,
    timeline: '1-2 weeks',
    steps: [
      'Create Google Data Studio (Looker Studio) dashboard',
      'Connect all ad platforms (Google Ads, Meta, LinkedIn)',
      'Add key metrics: Spend, Conversions, CPA, ROAS',
      'Set up automated weekly email reports',
      'Create separate views for executive summary vs detailed analysis',
      'Schedule monthly review meetings based on dashboard data'
    ],
    expected_result: 'Save 5-10 hours per week on manual reporting. Real-time performance visibility.',
    category: 'Tracking & Analytics'
  });

  actions.push({
    title: 'Implement Audience Segmentation',
    priority: 'LOW',
    impact: 'Medium',
    effort: 3,
    timeline: '2-3 weeks',
    steps: [
      'Segment audiences by stage (Awareness, Consideration, Decision)',
      'Create custom messaging for each segment',
      'Set up retargeting campaigns for website visitors',
      'Create lookalike audiences from best customers',
      'Use exclusions to prevent over-targeting',
      'Test different offers/CTAs per audience segment'
    ],
    expected_result: '20-35% improvement in ad relevance and engagement. Higher conversion rates from targeted messaging.',
    category: 'Audience Optimization'
  });

  const sortedActions = actions.sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return a.effort - b.effort;
  });

  return sortedActions;
}
