import { supabase } from '../supabase';

export interface MetaAdsCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
}

export interface MetaAdsMetrics {
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  cpc: number;
  cpm: number;
  roas: number;
  date: string;
  platform: 'facebook' | 'instagram' | 'audience_network' | 'messenger';
}

export class MetaAdsClient {
  private accessToken: string;
  private adAccountId: string;

  constructor(accessToken: string, adAccountId: string) {
    this.accessToken = accessToken;
    this.adAccountId = adAccountId;
  }

  async getCampaignInsights(dateRange: { startDate: string; endDate: string }): Promise<MetaAdsMetrics[]> {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-meta-ads`;
    const { data: sessionData } = await supabase.auth.getSession();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionData.session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'fetch_insights',
        access_token: this.accessToken,
        ad_account_id: this.adAccountId,
        date_range: dateRange
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Meta Ads insights');
    }

    const data = await response.json();
    return data.insights || [];
  }

  async syncToDatabase(userId: string, clientId: string, dateRange: { startDate: string; endDate: string }): Promise<void> {
    const insights = await this.getCampaignInsights(dateRange);

    const campaignGroups = insights.reduce((acc, insight) => {
      if (!acc[insight.campaignId]) {
        acc[insight.campaignId] = [];
      }
      acc[insight.campaignId].push(insight);
      return acc;
    }, {} as Record<string, MetaAdsMetrics[]>);

    for (const [campaignId, campaignInsights] of Object.entries(campaignGroups)) {
      const totalSpend = campaignInsights.reduce((sum, i) => sum + i.spend, 0);
      const totalImpressions = campaignInsights.reduce((sum, i) => sum + i.impressions, 0);
      const totalClicks = campaignInsights.reduce((sum, i) => sum + i.clicks, 0);
      const totalConversions = campaignInsights.reduce((sum, i) => sum + i.conversions, 0);
      const totalRevenue = campaignInsights.reduce((sum, i) => sum + i.conversionValue, 0);

      const { error: campaignError } = await supabase
        .from('marketing_campaigns')
        .upsert({
          user_id: userId,
          campaign_name: campaignInsights[0].campaignName,
          campaign_type: 'paid_social',
          channel: 'Meta Ads',
          actual_spend: totalSpend,
          impressions: totalImpressions,
          clicks: totalClicks,
          leads: totalConversions,
          revenue_generated: totalRevenue,
          status: 'active',
          start_date: dateRange.startDate,
          metadata: {
            external_campaign_id: campaignId,
            platforms: [...new Set(campaignInsights.map(i => i.platform))]
          }
        }, {
          onConflict: 'user_id,external_id',
          ignoreDuplicates: false
        });

      if (campaignError) {
        console.error('Error syncing campaign:', campaignError);
      }

      for (const insight of campaignInsights) {
        const { error: metricsError } = await supabase
          .from('marketing_channel_metrics')
          .insert({
            user_id: userId,
            client_id: clientId,
            channel: 'paid_social',
            source: `meta_${insight.platform}`,
            campaign_name: insight.campaignName,
            metric_date: insight.date,
            impressions: insight.impressions,
            clicks: insight.clicks,
            spend: insight.spend,
            conversions: insight.conversions,
            revenue: insight.conversionValue,
            ctr: insight.ctr,
            cpc: insight.cpc,
            cpm: insight.cpm,
            roas: insight.roas
          });

        if (metricsError && metricsError.code !== '23505') {
          console.error('Error syncing metrics:', metricsError);
        }
      }
    }
  }
}

export async function refreshMetaAdsData(integrationId: string): Promise<void> {
  const { data: integration } = await supabase
    .from('integrations')
    .select('*, clients(id)')
    .eq('id', integrationId)
    .single();

  if (!integration || !integration.config.access_token) {
    throw new Error('Integration not found or missing credentials');
  }

  const adAccountId = integration.config.ad_account_id;
  if (!adAccountId) {
    throw new Error('Meta Ads account ID not configured');
  }

  const client = new MetaAdsClient(integration.config.access_token, adAccountId);

  const endDate = new Date().toISOString().split('T')[0];
  const startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  await client.syncToDatabase(
    integration.user_id,
    integration.client_id,
    { startDate, endDate }
  );

  await supabase
    .from('integrations')
    .update({ last_sync_at: new Date().toISOString() })
    .eq('id', integrationId);
}
