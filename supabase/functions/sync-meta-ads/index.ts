const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface MetaAdsRequest {
  action: 'fetch_insights';
  access_token: string;
  ad_account_id: string;
  date_range: {
    startDate: string;
    endDate: string;
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { action, access_token, ad_account_id, date_range }: MetaAdsRequest = await req.json();

    if (action === 'fetch_insights') {
      const fields = [
        'campaign_id',
        'campaign_name',
        'impressions',
        'clicks',
        'spend',
        'actions',
        'action_values',
        'ctr',
        'cpc',
        'cpm',
        'publisher_platform'
      ].join(',');

      const params = new URLSearchParams({
        access_token: access_token,
        fields: fields,
        time_range: JSON.stringify({
          since: date_range.startDate,
          until: date_range.endDate
        }),
        level: 'campaign',
        breakdowns: 'publisher_platform',
        time_increment: '1'
      });

      const url = `https://graph.facebook.com/v18.0/${ad_account_id}/insights?${params.toString()}`;
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Meta Ads API error:', errorText);
        throw new Error('Failed to fetch Meta Ads data');
      }

      const data = await response.json();
      const insights = [];

      for (const insight of data.data || []) {
        const conversions = insight.actions?.find((a: any) =>
          a.action_type === 'purchase' || a.action_type === 'lead'
        )?.value || 0;

        const conversionValue = insight.action_values?.find((a: any) =>
          a.action_type === 'purchase' || a.action_type === 'omni_purchase'
        )?.value || 0;

        const spend = parseFloat(insight.spend || '0');
        const roas = spend > 0 ? parseFloat(conversionValue) / spend : 0;

        let platform = 'facebook';
        if (insight.publisher_platform) {
          platform = insight.publisher_platform.toLowerCase();
        }

        insights.push({
          campaignId: insight.campaign_id,
          campaignName: insight.campaign_name,
          impressions: parseInt(insight.impressions || '0'),
          clicks: parseInt(insight.clicks || '0'),
          spend: spend,
          conversions: parseInt(conversions),
          conversionValue: parseFloat(conversionValue),
          ctr: parseFloat(insight.ctr || '0'),
          cpc: parseFloat(insight.cpc || '0'),
          cpm: parseFloat(insight.cpm || '0'),
          roas: roas,
          date: insight.date_start || date_range.startDate,
          platform: platform
        });
      }

      return new Response(JSON.stringify({ insights }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200
      });
    }

    throw new Error('Unsupported action');
  } catch (error) {
    console.error('Meta Ads sync error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to sync Meta Ads data'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 400
    });
  }
});
