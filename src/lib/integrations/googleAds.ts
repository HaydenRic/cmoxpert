import { supabase } from '../supabase';

export interface GoogleAdsCampaign {
  id: string;
  name: string;
  status: string;
  budget: number;
  currency: string;
  startDate: string;
  endDate?: string;
}

export interface GoogleAdsMetrics {
  campaignId: string;
  campaignName: string;
  impressions: number;
  clicks: number;
  cost: number;
  conversions: number;
  conversionValue: number;
  ctr: number;
  cpc: number;
  cpa: number;
  roas: number;
  date: string;
}

export class GoogleAdsClient {
  private accessToken: string;
  private customerId: string;

  constructor(accessToken: string, customerId: string) {
    this.accessToken = accessToken;
    this.customerId = customerId;
  }

  async getCampaigns(dateRange: { startDate: string; endDate: string }): Promise<GoogleAdsMetrics[]> {
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/sync-google-ads`;
    const { data: sessionData } = await supabase.auth.getSession();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionData.session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'fetch_campaigns',
        access_token: this.accessToken,
        customer_id: this.customerId,
        date_range: dateRange
      })
    });

    if (!response.ok) {
      throw new Error('Failed to fetch Google Ads campaigns');
    }

    const data = await response.json();
    return data.campaigns || [];
  }

  async syncToDatabase(userId: string, clientId: string, dateRange: { startDate: string; endDate: string }): Promise<void> {
    const campaigns = await this.getCampaigns(dateRange);

    for (const campaign of campaigns) {
      const { error: campaignError } = await supabase
        .from('marketing_campaigns')
        .upsert({
          user_id: userId,
          campaign_name: campaign.campaignName,
          campaign_type: 'paid_search',
          channel: 'Google Ads',
          actual_spend: campaign.cost,
          impressions: campaign.impressions,
          clicks: campaign.clicks,
          leads: campaign.conversions,
          revenue_generated: campaign.conversionValue,
          status: 'active',
          start_date: dateRange.startDate,
          metadata: {
            external_campaign_id: campaign.campaignId,
            ctr: campaign.ctr,
            cpc: campaign.cpc,
            cpa: campaign.cpa,
            roas: campaign.roas
          }
        }, {
          onConflict: 'user_id,external_id',
          ignoreDuplicates: false
        });

      if (campaignError) {
        console.error('Error syncing campaign:', campaignError);
      }

      const { error: metricsError } = await supabase
        .from('marketing_channel_metrics')
        .insert({
          user_id: userId,
          client_id: clientId,
          channel: 'paid_search',
          source: 'google_ads',
          campaign_name: campaign.campaignName,
          metric_date: campaign.date,
          impressions: campaign.impressions,
          clicks: campaign.clicks,
          spend: campaign.cost,
          conversions: campaign.conversions,
          revenue: campaign.conversionValue,
          ctr: campaign.ctr,
          cpc: campaign.cpc,
          cpa: campaign.cpa,
          roas: campaign.roas
        });

      if (metricsError && metricsError.code !== '23505') {
        console.error('Error syncing metrics:', metricsError);
      }
    }
  }
}

export async function refreshGoogleAdsData(integrationId: string): Promise<void> {
  const { data: integration } = await supabase
    .from('integrations')
    .select('*, clients(id)')
    .eq('id', integrationId)
    .single();

  if (!integration || !integration.config.access_token) {
    throw new Error('Integration not found or missing credentials');
  }

  const customerId = integration.config.customer_id;
  if (!customerId) {
    throw new Error('Google Ads customer ID not configured');
  }

  const client = new GoogleAdsClient(integration.config.access_token, customerId);

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
