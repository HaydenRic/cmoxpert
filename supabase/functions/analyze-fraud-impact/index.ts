import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
};

interface FraudAnalysisRequest {
  client_id: string;
  date_range: {
    start_date: string;
    end_date: string;
  };
  channels?: string[];
}

interface FraudImpactResult {
  total_marketing_spend: number;
  fraud_waste: number;
  fraud_rate: number;
  clean_cac: number;
  dirty_cac: number;
  cac_improvement: number;
  by_channel: {
    channel: string;
    spend: number;
    fraud_rate: number;
    fraud_waste: number;
    clean_cac: number;
  }[];
  recommendations: string[];
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { client_id, date_range, channels }: FraudAnalysisRequest = await req.json();

    const { data: fraudData, error: fraudError } = await supabase
      .from('fraud_events')
      .select(`
        marketing_channel,
        marketing_cost_wasted,
        confidence_score
      `)
      .eq('client_id', client_id)
      .gte('detected_at', date_range.start_date)
      .lte('detected_at', date_range.end_date)
      .in('status', ['confirmed', 'detected']);

    if (fraudError) throw fraudError;

    const { data: metricsData, error: metricsError } = await supabase
      .from('fintech_metrics_daily')
      .select(`
        channel,
        marketing_spend,
        fraud_waste,
        total_registrations,
        fraud_flags,
        cac_raw,
        cac_clean
      `)
      .eq('client_id', client_id)
      .gte('metric_date', date_range.start_date)
      .lte('metric_date', date_range.end_date);

    if (metricsError) throw metricsError;

    const channelMap = new Map<string, {
      spend: number;
      fraud_waste: number;
      registrations: number;
      fraud_count: number;
    }>();

    metricsData?.forEach((metric: any) => {
      const existing = channelMap.get(metric.channel) || {
        spend: 0,
        fraud_waste: 0,
        registrations: 0,
        fraud_count: 0,
      };

      channelMap.set(metric.channel, {
        spend: existing.spend + Number(metric.marketing_spend || 0),
        fraud_waste: existing.fraud_waste + Number(metric.fraud_waste || 0),
        registrations: existing.registrations + Number(metric.total_registrations || 0),
        fraud_count: existing.fraud_count + Number(metric.fraud_flags || 0),
      });
    });

    let total_spend = 0;
    let total_fraud_waste = 0;
    let total_registrations = 0;
    let total_fraud_count = 0;

    channelMap.forEach((value) => {
      total_spend += value.spend;
      total_fraud_waste += value.fraud_waste;
      total_registrations += value.registrations;
      total_fraud_count += value.fraud_count;
    });

    const fraud_rate = total_registrations > 0
      ? total_fraud_count / total_registrations
      : 0;

    const clean_registrations = total_registrations - total_fraud_count;
    const clean_spend = total_spend - total_fraud_waste;

    const dirty_cac = total_registrations > 0
      ? total_spend / total_registrations
      : 0;

    const clean_cac = clean_registrations > 0
      ? clean_spend / clean_registrations
      : 0;

    const cac_improvement = dirty_cac - clean_cac;

    const by_channel = Array.from(channelMap.entries()).map(([channel, data]) => {
      const channel_fraud_rate = data.registrations > 0
        ? data.fraud_count / data.registrations
        : 0;

      const clean_reg = data.registrations - data.fraud_count;
      const channel_clean_cac = clean_reg > 0
        ? (data.spend - data.fraud_waste) / clean_reg
        : 0;

      return {
        channel,
        spend: data.spend,
        fraud_rate: channel_fraud_rate,
        fraud_waste: data.fraud_waste,
        clean_cac: channel_clean_cac,
        registrations: data.registrations,
        fraud_count: data.fraud_count,
      };
    })
    .sort((a, b) => b.fraud_waste - a.fraud_waste);

    const recommendations: string[] = [];

    const high_fraud_channels = by_channel.filter(c => c.fraud_rate > 0.25);
    if (high_fraud_channels.length > 0) {
      recommendations.push(
        `CRITICAL: ${high_fraud_channels.length} channels have fraud rates above 25%. ` +
        `Consider pausing: ${high_fraud_channels.map(c => c.channel).join(', ')}`
      );
    }

    const low_fraud_channels = by_channel.filter(c => c.fraud_rate < 0.10 && c.registrations > 50);
    if (low_fraud_channels.length > 0 && total_fraud_waste > 1000) {
      recommendations.push(
        `Reallocate $${total_fraud_waste.toFixed(0)} from high-fraud sources to: ` +
        `${low_fraud_channels.slice(0, 3).map(c => c.channel).join(', ')}`
      );
    }

    if (fraud_rate > 0.20) {
      recommendations.push(
        `Overall fraud rate of ${(fraud_rate * 100).toFixed(1)}% is dangerously high. ` +
        `Implement stricter pre-registration screening.`
      );
    }

    if (fraud_rate < 0.05) {
      recommendations.push(
        `Excellent fraud management. Your fraud rate of ${(fraud_rate * 100).toFixed(1)}% ` +
        `is well below industry average of 15-20%.`
      );
    }

    const result: FraudImpactResult = {
      total_marketing_spend: total_spend,
      fraud_waste: total_fraud_waste,
      fraud_rate: fraud_rate,
      clean_cac: clean_cac,
      dirty_cac: dirty_cac,
      cac_improvement: cac_improvement,
      by_channel: by_channel.slice(0, 10),
      recommendations,
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error analyzing fraud impact:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Internal server error',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
