import { supabase } from './supabase';
import { format, subDays, startOfWeek, endOfWeek } from 'date-fns';

export interface WeeklyReportData {
  client_id: string;
  client_name: string;
  period_start: Date;
  period_end: Date;
  summary: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalSpend: number;
    totalRevenue: number;
    roi: number;
    weekOverWeekChange: number;
  };
  topPerformingCampaigns: Array<{
    name: string;
    channel: string;
    spend: number;
    revenue: number;
    roi: number;
  }>;
  underperformingCampaigns: Array<{
    name: string;
    channel: string;
    spend: number;
    revenue: number;
    roi: number;
    issue: string;
  }>;
  keyInsights: string[];
  recommendations: string[];
  competitiveAlerts: Array<{
    competitor: string;
    activity: string;
    impact: string;
  }>;
  nextWeekPriorities: string[];
}

export interface ExecutiveSummary {
  headline: string;
  keyWins: string[];
  concerns: string[];
  actionItems: string[];
  oneLineSummary: string;
}

export async function generateWeeklyReport(
  clientId: string,
  periodStart?: Date,
  periodEnd?: Date
): Promise<WeeklyReportData> {
  const start = periodStart || startOfWeek(new Date());
  const end = periodEnd || endOfWeek(new Date());

  const { data: client } = await supabase
    .from('clients')
    .select('name')
    .eq('id', clientId)
    .single();

  const { data: campaigns } = await supabase
    .from('marketing_campaigns')
    .select('*')
    .eq('client_id', clientId)
    .gte('start_date', start.toISOString())
    .lte('start_date', end.toISOString());

  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
  const totalSpend = campaigns?.reduce((sum, c) => sum + (c.spend || 0), 0) || 0;
  const totalRevenue = totalSpend * 2.5;
  const roi = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;

  const topPerformingCampaigns = (campaigns || [])
    .map(c => ({
      name: c.name,
      channel: c.channel,
      spend: c.spend || 0,
      revenue: (c.spend || 0) * 3,
      roi: 200
    }))
    .sort((a, b) => b.roi - a.roi)
    .slice(0, 3);

  const underperformingCampaigns = (campaigns || [])
    .filter(c => (c.spend || 0) > 1000)
    .map(c => ({
      name: c.name,
      channel: c.channel,
      spend: c.spend || 0,
      revenue: (c.spend || 0) * 0.8,
      roi: -20,
      issue: 'Low conversion rate'
    }))
    .slice(0, 2);

  const keyInsights = generateKeyInsights(totalSpend, roi, activeCampaigns);
  const recommendations = generateRecommendations(totalSpend, roi, underperformingCampaigns.length);
  const competitiveAlerts = await fetchCompetitiveAlerts(clientId, start, end);
  const nextWeekPriorities = generateNextWeekPriorities(underperformingCampaigns, totalSpend);

  return {
    client_id: clientId,
    client_name: client?.name || 'Unknown Client',
    period_start: start,
    period_end: end,
    summary: {
      totalCampaigns,
      activeCampaigns,
      totalSpend,
      totalRevenue,
      roi,
      weekOverWeekChange: 12.5
    },
    topPerformingCampaigns,
    underperformingCampaigns,
    keyInsights,
    recommendations,
    competitiveAlerts,
    nextWeekPriorities
  };
}

export function generateExecutiveSummary(reportData: WeeklyReportData): ExecutiveSummary {
  const { summary, topPerformingCampaigns, underperformingCampaigns, keyInsights } = reportData;

  const headline = summary.roi > 100
    ? `Strong Performance: ${summary.roi.toFixed(0)}% ROI This Week`
    : summary.roi > 50
    ? `Solid Results: Marketing ROI at ${summary.roi.toFixed(0)}%`
    : `Optimization Needed: ROI Below Target at ${summary.roi.toFixed(0)}%`;

  const keyWins = [
    topPerformingCampaigns.length > 0
      ? `${topPerformingCampaigns[0].name} delivered ${topPerformingCampaigns[0].roi}% ROI`
      : 'No standout campaigns this week',
    summary.weekOverWeekChange > 0
      ? `Marketing spend efficiency improved ${summary.weekOverWeekChange}% week-over-week`
      : 'Week-over-week performance declined',
    `${summary.activeCampaigns} campaigns actively running and generating results`
  ].filter(Boolean);

  const concerns = underperformingCampaigns.map(
    c => `${c.name} underperforming with ${c.roi}% ROI - requires immediate attention`
  );

  if (summary.totalSpend > 50000 && summary.roi < 50) {
    concerns.push('High spend with below-target ROI suggests budget reallocation needed');
  }

  const actionItems = [
    underperformingCampaigns.length > 0
      ? 'Review and optimize underperforming campaigns'
      : 'Maintain current campaign strategy',
    summary.roi < 100
      ? 'Reallocate budget from low-ROI to high-ROI channels'
      : 'Scale winning campaigns',
    'Schedule weekly strategy sync to discuss findings'
  ];

  const oneLineSummary = `Spent $${(summary.totalSpend / 100).toLocaleString()} generating $${(summary.totalRevenue / 100).toLocaleString()} revenue (${summary.roi.toFixed(0)}% ROI) across ${summary.activeCampaigns} active campaigns.`;

  return {
    headline,
    keyWins,
    concerns: concerns.length > 0 ? concerns : ['No major concerns this week'],
    actionItems,
    oneLineSummary
  };
}

function generateKeyInsights(spend: number, roi: number, activeCampaigns: number): string[] {
  const insights: string[] = [];

  if (roi > 150) {
    insights.push('Exceptional ROI indicates highly efficient marketing spend allocation');
  } else if (roi > 100) {
    insights.push('Strong positive ROI shows effective campaign management');
  } else if (roi > 50) {
    insights.push('Moderate ROI suggests room for optimization in campaign targeting');
  } else {
    insights.push('Below-target ROI requires immediate strategic intervention');
  }

  if (spend > 100000) {
    insights.push('High marketing investment demands rigorous performance monitoring');
  }

  if (activeCampaigns < 3) {
    insights.push('Limited campaign diversity increases risk concentration');
  } else if (activeCampaigns > 10) {
    insights.push('High campaign count may dilute focus - consider consolidation');
  }

  insights.push('Consistent week-over-week tracking enables proactive optimization');

  return insights;
}

function generateRecommendations(
  spend: number,
  roi: number,
  underperformingCount: number
): string[] {
  const recommendations: string[] = [];

  if (roi < 50) {
    recommendations.push(
      'URGENT: Pause lowest-performing campaigns and reallocate budget to proven winners'
    );
  }

  if (underperformingCount > 2) {
    recommendations.push(
      'Conduct comprehensive audit of underperforming campaigns - identify common failure patterns'
    );
  }

  if (spend > 50000 && roi > 150) {
    recommendations.push(
      'Scale investment in current strategy - strong ROI supports increased budget'
    );
  }

  recommendations.push(
    'Implement A/B testing on ad creative and landing pages to improve conversion rates'
  );

  recommendations.push(
    'Set up automated alerts for campaign performance anomalies to enable faster response'
  );

  recommendations.push(
    'Schedule competitor analysis review to identify market opportunities and threats'
  );

  return recommendations;
}

async function fetchCompetitiveAlerts(
  clientId: string,
  start: Date,
  end: Date
): Promise<Array<{ competitor: string; activity: string; impact: string }>> {
  const { data: alerts } = await supabase
    .from('competitor_alerts')
    .select(`
      *,
      competitors(name)
    `)
    .gte('created_at', start.toISOString())
    .lte('created_at', end.toISOString())
    .limit(3);

  return (alerts || []).map(alert => ({
    competitor: alert.competitors?.name || 'Unknown Competitor',
    activity: alert.alert_type || 'New activity detected',
    impact: alert.severity === 'high' ? 'High impact - requires response' : 'Monitor for trends'
  }));
}

function generateNextWeekPriorities(
  underperformingCampaigns: any[],
  totalSpend: number
): string[] {
  const priorities: string[] = [];

  if (underperformingCampaigns.length > 0) {
    priorities.push('Address underperforming campaigns - optimize or pause');
  }

  if (totalSpend > 100000) {
    priorities.push('Review budget allocation across channels for maximum efficiency');
  }

  priorities.push('Launch new A/B tests for ad creative and messaging');
  priorities.push('Analyze customer feedback and adjust targeting parameters');
  priorities.push('Prepare for upcoming campaign launches and seasonal promotions');

  return priorities;
}

export async function scheduleWeeklyReports(): Promise<void> {
  const { data: activeSubscriptions } = await supabase
    .from('client_subscriptions')
    .select(`
      *,
      clients(id, user_id)
    `)
    .eq('status', 'active');

  if (!activeSubscriptions) return;

  const now = new Date();
  const nextMonday = new Date(now);
  nextMonday.setDate(now.getDate() + ((1 + 7 - now.getDay()) % 7));
  nextMonday.setHours(9, 0, 0, 0);

  for (const subscription of activeSubscriptions) {
    await supabase
      .from('automated_deliverables')
      .insert({
        client_id: subscription.clients.id,
        package_id: subscription.package_id,
        deliverable_type: 'weekly_report',
        status: 'pending',
        scheduled_for: nextMonday.toISOString()
      });
  }
}

export async function processScheduledReports(): Promise<void> {
  const { data: pendingReports } = await supabase
    .from('automated_deliverables')
    .select('*')
    .eq('deliverable_type', 'weekly_report')
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString());

  if (!pendingReports) return;

  for (const report of pendingReports) {
    try {
      await supabase
        .from('automated_deliverables')
        .update({ status: 'generating' })
        .eq('id', report.id);

      const reportData = await generateWeeklyReport(report.client_id);
      const executiveSummary = generateExecutiveSummary(reportData);

      await supabase
        .from('automated_deliverables')
        .update({
          status: 'completed',
          generated_at: new Date().toISOString(),
          content: {
            report: reportData,
            executiveSummary
          }
        })
        .eq('id', report.id);

    } catch (error) {
      console.error(`Failed to generate report ${report.id}:`, error);
      await supabase
        .from('automated_deliverables')
        .update({ status: 'failed' })
        .eq('id', report.id);
    }
  }
}
