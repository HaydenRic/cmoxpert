import { supabase } from './supabase';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';

export interface MonthlyStrategyData {
  client_id: string;
  client_name: string;
  period_start: Date;
  period_end: Date;
  performance_summary: {
    totalSpend: number;
    totalRevenue: number;
    roi: number;
    monthOverMonthGrowth: number;
    customerAcquisitionCost: number;
    lifetimeValue: number;
  };
  channel_analysis: Array<{
    channel: string;
    spend: number;
    revenue: number;
    roi: number;
    trend: 'improving' | 'declining' | 'stable';
    recommendation: string;
  }>;
  budget_recommendations: Array<{
    action: 'increase' | 'decrease' | 'maintain' | 'pause';
    channel: string;
    currentSpend: number;
    recommendedSpend: number;
    rationale: string;
    expectedImpact: string;
  }>;
  strategic_priorities: string[];
  market_opportunities: Array<{
    opportunity: string;
    potential: 'high' | 'medium' | 'low';
    effort: 'high' | 'medium' | 'low';
    timeline: string;
  }>;
  competitive_positioning: {
    strengths: string[];
    weaknesses: string[];
    threats: string[];
    opportunities: string[];
  };
  next_month_goals: Array<{
    goal: string;
    target: string;
    tactics: string[];
  }>;
}

export async function generateMonthlyStrategy(
  clientId: string,
  periodStart?: Date,
  periodEnd?: Date
): Promise<MonthlyStrategyData> {
  const start = periodStart || startOfMonth(new Date());
  const end = periodEnd || endOfMonth(new Date());
  const previousMonthStart = subMonths(start, 1);
  const previousMonthEnd = endOfMonth(previousMonthStart);

  // Fetch client info
  const { data: client } = await supabase
    .from('clients')
    .select('name')
    .eq('id', clientId)
    .single();

  // Fetch current month campaigns
  const { data: currentCampaigns } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('client_id', clientId)
    .gte('start_date', start.toISOString())
    .lte('start_date', end.toISOString());

  // Fetch previous month campaigns for comparison
  const { data: previousCampaigns } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('client_id', clientId)
    .gte('start_date', previousMonthStart.toISOString())
    .lte('start_date', previousMonthEnd.toISOString());

  // Calculate current month metrics
  const currentSpend = currentCampaigns?.reduce((sum, c) => sum + (c.spend || 0), 0) || 0;
  const currentRevenue = currentSpend * 2.8; // Simulated
  const currentRoi = currentSpend > 0 ? ((currentRevenue - currentSpend) / currentSpend) * 100 : 0;

  // Calculate previous month metrics
  const previousSpend = previousCampaigns?.reduce((sum, c) => sum + (c.spend || 0), 0) || 0;
  const previousRevenue = previousSpend * 2.5; // Simulated
  const monthOverMonthGrowth = previousRevenue > 0
    ? ((currentRevenue - previousRevenue) / previousRevenue) * 100
    : 0;

  // Simulated metrics
  const customerAcquisitionCost = currentSpend > 0 ? currentSpend / 50 : 0; // $50 per customer avg
  const lifetimeValue = customerAcquisitionCost * 4; // 4x LTV:CAC ratio

  const performance_summary = {
    totalSpend: currentSpend,
    totalRevenue: currentRevenue,
    roi: currentRoi,
    monthOverMonthGrowth,
    customerAcquisitionCost,
    lifetimeValue
  };

  // Analyze by channel
  const channel_analysis = analyzeChannels(currentCampaigns || [], previousCampaigns || []);

  // Generate budget recommendations
  const budget_recommendations = generateBudgetRecommendations(channel_analysis, currentSpend);

  // Create strategic priorities
  const strategic_priorities = generateStrategicPriorities(
    performance_summary,
    channel_analysis,
    clientId
  );

  // Identify market opportunities
  const market_opportunities = await identifyMarketOpportunities(clientId, performance_summary);

  // SWOT analysis
  const competitive_positioning = generateSWOTAnalysis(
    performance_summary,
    channel_analysis,
    clientId
  );

  // Set next month goals
  const next_month_goals = generateNextMonthGoals(performance_summary, channel_analysis);

  return {
    client_id: clientId,
    client_name: client?.name || 'Unknown Client',
    period_start: start,
    period_end: end,
    performance_summary,
    channel_analysis,
    budget_recommendations,
    strategic_priorities,
    market_opportunities,
    competitive_positioning,
    next_month_goals
  };
}

function analyzeChannels(
  currentCampaigns: any[],
  previousCampaigns: any[]
): Array<{
  channel: string;
  spend: number;
  revenue: number;
  roi: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendation: string;
}> {
  const channels = ['paid_search', 'paid_social', 'display', 'email', 'organic'];

  return channels.map(channel => {
    const currentChannelCampaigns = currentCampaigns.filter(c => c.channel === channel);
    const previousChannelCampaigns = previousCampaigns.filter(c => c.channel === channel);

    const spend = currentChannelCampaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
    const revenue = spend * (2 + Math.random()); // Simulated variance
    const roi = spend > 0 ? ((revenue - spend) / spend) * 100 : 0;

    const previousSpend = previousChannelCampaigns.reduce((sum, c) => sum + (c.spend || 0), 0);
    const previousRevenue = previousSpend * 2.5;
    const previousRoi = previousSpend > 0 ? ((previousRevenue - previousSpend) / previousSpend) * 100 : 0;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (roi > previousRoi + 10) trend = 'improving';
    else if (roi < previousRoi - 10) trend = 'declining';

    const recommendation = getChannelRecommendation(channel, roi, trend, spend);

    return {
      channel: formatChannelName(channel),
      spend,
      revenue,
      roi,
      trend,
      recommendation
    };
  }).filter(c => c.spend > 0);
}

function formatChannelName(channel: string): string {
  const names: Record<string, string> = {
    paid_search: 'Paid Search',
    paid_social: 'Paid Social',
    display: 'Display Advertising',
    email: 'Email Marketing',
    organic: 'Organic/SEO'
  };
  return names[channel] || channel;
}

function getChannelRecommendation(
  channel: string,
  roi: number,
  trend: string,
  spend: number
): string {
  if (roi > 200 && trend === 'improving') {
    return `Exceptional performance - increase budget by 30-50% to scale winning campaigns`;
  } else if (roi > 150 && trend === 'improving') {
    return `Strong ROI with positive momentum - increase budget by 20-30%`;
  } else if (roi > 100 && trend === 'stable') {
    return `Solid performance - maintain current budget and optimize creative`;
  } else if (roi > 50 && trend === 'declining') {
    return `Declining efficiency - conduct creative refresh and targeting audit`;
  } else if (roi < 50) {
    return `Underperforming - reduce budget by 50% and test new approaches or pause`;
  } else {
    return `Monitor closely - maintain current strategy with A/B testing`;
  }
}

function generateBudgetRecommendations(
  channelAnalysis: any[],
  totalSpend: number
): Array<{
  action: 'increase' | 'decrease' | 'maintain' | 'pause';
  channel: string;
  currentSpend: number;
  recommendedSpend: number;
  rationale: string;
  expectedImpact: string;
}> {
  return channelAnalysis.map(channel => {
    let action: 'increase' | 'decrease' | 'maintain' | 'pause' = 'maintain';
    let multiplier = 1.0;
    let rationale = '';
    let expectedImpact = '';

    if (channel.roi > 200 && channel.trend === 'improving') {
      action = 'increase';
      multiplier = 1.4;
      rationale = 'Exceptional ROI with improving trend justifies aggressive scaling';
      expectedImpact = `Projected to generate additional $${((channel.spend * 0.4 * channel.roi) / 100).toLocaleString()} in revenue`;
    } else if (channel.roi > 150) {
      action = 'increase';
      multiplier = 1.25;
      rationale = 'Strong positive ROI supports increased investment';
      expectedImpact = `Expected to improve overall portfolio ROI by 8-12%`;
    } else if (channel.roi < 50) {
      action = channel.roi < 25 ? 'pause' : 'decrease';
      multiplier = channel.roi < 25 ? 0 : 0.5;
      rationale = 'Below-target ROI requires immediate corrective action';
      expectedImpact = `Reallocating $${(channel.spend * (1 - multiplier)).toLocaleString()} to higher-performing channels`;
    } else if (channel.trend === 'declining') {
      action = 'decrease';
      multiplier = 0.75;
      rationale = 'Declining performance suggests market saturation or creative fatigue';
      expectedImpact = 'Reduced budget allows for strategic testing while minimizing risk';
    } else {
      action = 'maintain';
      rationale = 'Current performance is satisfactory - focus on optimization';
      expectedImpact = 'Consistent results while improving efficiency through testing';
    }

    return {
      action,
      channel: channel.channel,
      currentSpend: channel.spend,
      recommendedSpend: Math.round(channel.spend * multiplier),
      rationale,
      expectedImpact
    };
  });
}

function generateStrategicPriorities(
  performance: any,
  channels: any[],
  clientId: string
): string[] {
  const priorities: string[] = [];

  // ROI-based priorities
  if (performance.roi < 100) {
    priorities.push('URGENT: Improve overall marketing ROI to positive territory through budget reallocation');
  } else if (performance.roi > 200) {
    priorities.push('Scale winning campaigns aggressively while maintaining quality and efficiency');
  }

  // Growth priorities
  if (performance.monthOverMonthGrowth < 0) {
    priorities.push('Reverse negative growth trend through channel diversification and creative refresh');
  } else if (performance.monthOverMonthGrowth > 30) {
    priorities.push('Maintain explosive growth momentum while optimizing for sustainable efficiency');
  }

  // Channel-specific priorities
  const decliningChannels = channels.filter(c => c.trend === 'declining');
  if (decliningChannels.length > 0) {
    priorities.push(`Address declining performance in ${decliningChannels.map(c => c.channel).join(', ')}`);
  }

  // CAC/LTV priorities
  if (performance.lifetimeValue / performance.customerAcquisitionCost < 3) {
    priorities.push('Improve LTV:CAC ratio through retention initiatives and upsell campaigns');
  }

  // Always include these
  priorities.push('Implement systematic A/B testing across all active channels');
  priorities.push('Develop content marketing strategy to reduce paid acquisition dependency');
  priorities.push('Build competitive intelligence system for proactive market response');

  return priorities.slice(0, 6); // Top 6 priorities
}

async function identifyMarketOpportunities(
  clientId: string,
  performance: any
): Promise<Array<{
  opportunity: string;
  potential: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  timeline: string;
}>> {
  return [
    {
      opportunity: 'Launch influencer partnership program for social proof and reach',
      potential: 'high',
      effort: 'medium',
      timeline: '6-8 weeks to first campaign'
    },
    {
      opportunity: 'Develop thought leadership content for organic SEO growth',
      potential: 'high',
      effort: 'high',
      timeline: '3-6 months to see measurable impact'
    },
    {
      opportunity: 'Implement retargeting campaigns for abandoned cart recovery',
      potential: 'medium',
      effort: 'low',
      timeline: '2-3 weeks to launch'
    },
    {
      opportunity: 'Expand to new geographic markets with proven creative',
      potential: 'high',
      effort: 'medium',
      timeline: '4-6 weeks for market testing'
    },
    {
      opportunity: 'Build referral program to reduce CAC through word-of-mouth',
      potential: 'medium',
      effort: 'medium',
      timeline: '6-8 weeks to implement'
    }
  ];
}

function generateSWOTAnalysis(
  performance: any,
  channels: any[],
  clientId: string
): {
  strengths: string[];
  weaknesses: string[];
  threats: string[];
  opportunities: string[];
} {
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const threats: string[] = [];
  const opportunities: string[] = [];

  // Strengths
  const highPerformingChannels = channels.filter(c => c.roi > 150);
  if (highPerformingChannels.length > 0) {
    strengths.push(`Strong ROI in ${highPerformingChannels.map(c => c.channel).join(', ')}`);
  }
  if (performance.monthOverMonthGrowth > 20) {
    strengths.push('Rapid revenue growth trajectory');
  }
  if (performance.lifetimeValue > performance.customerAcquisitionCost * 3) {
    strengths.push('Healthy LTV:CAC ratio supporting sustainable growth');
  }

  // Weaknesses
  const lowPerformingChannels = channels.filter(c => c.roi < 50);
  if (lowPerformingChannels.length > 0) {
    weaknesses.push(`Underperforming channels: ${lowPerformingChannels.map(c => c.channel).join(', ')}`);
  }
  if (channels.length < 3) {
    weaknesses.push('Limited channel diversification increases risk');
  }
  if (performance.customerAcquisitionCost > performance.lifetimeValue * 0.5) {
    weaknesses.push('High CAC relative to LTV constrains profitability');
  }

  // Threats
  if (channels.some(c => c.trend === 'declining')) {
    threats.push('Multiple channels showing declining efficiency - possible market saturation');
  }
  threats.push('Increasing competition driving up advertising costs across all channels');
  threats.push('Platform algorithm changes may impact organic and paid reach');

  // Opportunities
  const improvingChannels = channels.filter(c => c.trend === 'improving');
  if (improvingChannels.length > 0) {
    opportunities.push(`Scale budget in improving channels: ${improvingChannels.map(c => c.channel).join(', ')}`);
  }
  opportunities.push('Expand into untapped channels to diversify revenue sources');
  opportunities.push('Implement marketing automation to improve efficiency and scale');

  return {
    strengths: strengths.length > 0 ? strengths : ['Building foundation for future growth'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['Minor optimization opportunities identified'],
    threats,
    opportunities
  };
}

function generateNextMonthGoals(
  performance: any,
  channels: any[]
): Array<{
  goal: string;
  target: string;
  tactics: string[];
}> {
  const goals = [];

  // Revenue goal
  const revenueTarget = Math.round(performance.totalRevenue * 1.25);
  goals.push({
    goal: 'Increase Monthly Revenue',
    target: `$${(revenueTarget / 100).toLocaleString()} (25% growth)`,
    tactics: [
      'Scale budget in top-performing channels by 30%',
      'Launch 3 new A/B tests on winning campaigns',
      'Implement conversion rate optimization on landing pages'
    ]
  });

  // ROI goal
  const roiTarget = Math.min(performance.roi * 1.15, 300);
  goals.push({
    goal: 'Improve Marketing ROI',
    target: `${roiTarget.toFixed(0)}% (15% improvement)`,
    tactics: [
      'Pause or reduce budget in campaigns with ROI < 50%',
      'Optimize audience targeting based on performance data',
      'Refresh creative assets for campaigns showing fatigue'
    ]
  });

  // CAC goal
  const cacTarget = Math.round(performance.customerAcquisitionCost * 0.85);
  goals.push({
    goal: 'Reduce Customer Acquisition Cost',
    target: `$${(cacTarget / 100).toFixed(0)} (15% reduction)`,
    tactics: [
      'Improve landing page conversion rates through UX optimization',
      'Implement retargeting to capture warm leads',
      'Launch referral program to leverage word-of-mouth'
    ]
  });

  return goals;
}

export async function scheduleMonthlyStrategies(): Promise<void> {
  const { data: activeSubscriptions } = await supabase
    .from('client_subscriptions')
    .select(`
      *,
      clients(id, user_id),
      service_packages(deliverables)
    `)
    .eq('status', 'active');

  if (!activeSubscriptions) return;

  const now = new Date();
  const firstOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  firstOfNextMonth.setHours(10, 0, 0, 0);

  for (const subscription of activeSubscriptions) {
    // Check if package includes monthly strategy
    const deliverables = subscription.service_packages.deliverables || [];
    const hasMonthlyStrategy = deliverables.some((d: any) => d.type === 'monthly_strategy');

    if (hasMonthlyStrategy) {
      await supabase
        .from('automated_deliverables')
        .insert({
          client_id: subscription.clients.id,
          package_id: subscription.package_id,
          deliverable_type: 'monthly_strategy',
          status: 'pending',
          scheduled_for: firstOfNextMonth.toISOString()
        });
    }
  }
}

export async function processMonthlyStrategies(): Promise<void> {
  const { data: pendingStrategies } = await supabase
    .from('automated_deliverables')
    .select('*')
    .eq('deliverable_type', 'monthly_strategy')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString());

  if (!pendingStrategies) return;

  for (const strategy of pendingStrategies) {
    try {
      await supabase
        .from('automated_deliverables')
        .update({ status: 'generating' })
        .eq('id', strategy.id);

      const strategyData = await generateMonthlyStrategy(strategy.client_id);

      await supabase
        .from('automated_deliverables')
        .update({
          status: 'completed',
          generated_at: new Date().toISOString(),
          content: {
            strategy: strategyData
          }
        })
        .eq('id', strategy.id);

    } catch (error) {
      console.error(`Failed to generate strategy ${strategy.id}:`, error);
      await supabase
        .from('automated_deliverables')
        .update({ status: 'failed' })
        .eq('id', strategy.id);
    }
  }
}
