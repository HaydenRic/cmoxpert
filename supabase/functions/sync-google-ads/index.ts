const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface GoogleAdsRequest {
  action: 'fetch_campaigns' | 'fetch_metrics';
  access_token: string;
  customer_id: string;
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
    
    const { action, access_token, customer_id, date_range }: GoogleAdsRequest = await req.json();

    if (action === 'fetch_campaigns') {
      const query = `
        SELECT
          campaign.id,
          campaign.name,
          campaign.status,
          metrics.impressions,
          metrics.clicks,
          metrics.cost_micros,
          metrics.conversions,
          metrics.conversions_value,
          segments.date
        FROM campaign
        WHERE segments.date BETWEEN '${date_range.startDate}' AND '${date_range.endDate}'
      `;

      const response = await fetch(
        `https://googleads.googleapis.com/v14/customers/${customer_id}/googleAds:searchStream`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json',
            'developer-token': Deno.env.get('GOOGLE_ADS_DEVELOPER_TOKEN') || '',
          },
          body: JSON.stringify({ query })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google Ads API error:', errorText);
        throw new Error('Failed to fetch Google Ads data');
      }

      const data = await response.json();
      const campaigns = [];

      for (const result of data) {
        const row = result.results ? result.results[0] : result;
        const costInDollars = (row.metrics?.costMicros || 0) / 1000000;
        const ctr = row.metrics?.clicks && row.metrics?.impressions
          ? (row.metrics.clicks / row.metrics.impressions) * 100
          : 0;
        const cpc = row.metrics?.clicks
          ? costInDollars / row.metrics.clicks
          : 0;
        const cpa = row.metrics?.conversions
          ? costInDollars / row.metrics.conversions
          : 0;
        const roas = costInDollars > 0
          ? (row.metrics?.conversionsValue || 0) / costInDollars
          : 0;

        campaigns.push({
          campaignId: row.campaign?.id,
          campaignName: row.campaign?.name,
          impressions: row.metrics?.impressions || 0,
          clicks: row.metrics?.clicks || 0,
          cost: costInDollars,
          conversions: row.metrics?.conversions || 0,
          conversionValue: row.metrics?.conversionsValue || 0,
          ctr: ctr,
          cpc: cpc,
          cpa: cpa,
          roas: roas,
          date: row.segments?.date || date_range.startDate
        });
      }

      return new Response(JSON.stringify({ campaigns }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 200
      });
    }

    throw new Error('Unsupported action');
  } catch (error) {
    console.error('Google Ads sync error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Failed to sync Google Ads data'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 400
    });
  }
});
