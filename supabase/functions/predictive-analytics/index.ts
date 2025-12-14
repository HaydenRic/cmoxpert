import { createClient } from 'npm:@supabase/supabase-js@2';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface CampaignMetrics {
  date: string;
  spend: number;
  conversions: number;
  revenue: number;
}

interface Prediction {
  date: string;
  predicted_spend: number;
  predicted_conversions: number;
  predicted_revenue: number;
  predicted_roas: number;
  confidence_interval: { lower: number; upper: number };
}

interface OptimizationRecommendation {
  channel: string;
  current_spend: number;
  recommended_spend: number;
  expected_revenue_increase: number;
  confidence: number;
  reasoning: string;
}

function calculateLinearRegression(data: number[][]): { slope: number; intercept: number } {
  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  for (const [x, y] of data) {
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function predictNextDays(historicalData: CampaignMetrics[], days: number = 30): Prediction[] {
  if (historicalData.length < 7) {
    return [];
  }

  const spendData = historicalData.map((d, i) => [i, d.spend]);
  const conversionData = historicalData.map((d, i) => [i, d.conversions]);
  const revenueData = historicalData.map((d, i) => [i, d.revenue]);

  const spendRegression = calculateLinearRegression(spendData);
  const conversionRegression = calculateLinearRegression(conversionData);
  const revenueRegression = calculateLinearRegression(revenueData);

  const predictions: Prediction[] = [];
  const baseIndex = historicalData.length;

  for (let i = 0; i < days; i++) {
    const futureIndex = baseIndex + i;
    const predictedSpend = Math.max(0, spendRegression.slope * futureIndex + spendRegression.intercept);
    const predictedConversions = Math.max(0, conversionRegression.slope * futureIndex + conversionRegression.intercept);
    const predictedRevenue = Math.max(0, revenueRegression.slope * futureIndex + revenueRegression.intercept);

    const roas = predictedSpend > 0 ? predictedRevenue / predictedSpend : 0;

    const variance = historicalData.reduce((sum, d) => {
      const actualRoas = d.spend > 0 ? d.revenue / d.spend : 0;
      return sum + Math.pow(actualRoas - roas, 2);
    }, 0) / historicalData.length;
    const stdDev = Math.sqrt(variance);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i + 1);

    predictions.push({
      date: futureDate.toISOString().split('T')[0],
      predicted_spend: Math.round(predictedSpend * 100) / 100,
      predicted_conversions: Math.round(predictedConversions),
      predicted_revenue: Math.round(predictedRevenue * 100) / 100,
      predicted_roas: Math.round(roas * 100) / 100,
      confidence_interval: {
        lower: Math.max(0, Math.round((roas - 1.96 * stdDev) * 100) / 100),
        upper: Math.round((roas + 1.96 * stdDev) * 100) / 100
      }
    });
  }

  return predictions;
}

function generateOptimizationRecommendations(
  channelData: Record<string, CampaignMetrics[]>,
  totalBudget: number
): OptimizationRecommendation[] {
  const recommendations: OptimizationRecommendation[] = [];

  const channelPerformance = Object.entries(channelData).map(([channel, data]) => {
    const totalSpend = data.reduce((sum, d) => sum + d.spend, 0);
    const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
    const avgRoas = totalSpend > 0 ? totalRevenue / totalSpend : 0;

    const recentData = data.slice(-7);
    const recentSpend = recentData.reduce((sum, d) => sum + d.spend, 0);
    const recentRevenue = recentData.reduce((sum, d) => sum + d.revenue, 0);
    const recentRoas = recentSpend > 0 ? recentRevenue / recentSpend : 0;

    const trend = recentRoas - avgRoas;

    return {
      channel,
      totalSpend,
      avgRoas,
      recentRoas,
      trend,
      efficiency: avgRoas
    };
  });

  channelPerformance.sort((a, b) => b.efficiency - a.efficiency);

  const totalCurrentSpend = channelPerformance.reduce((sum, c) => sum + c.totalSpend, 0);

  for (const channel of channelPerformance) {
    const currentAllocation = channel.totalSpend / totalCurrentSpend;
    let recommendedAllocation = currentAllocation;

    if (channel.efficiency > 3.0) {
      recommendedAllocation = Math.min(0.5, currentAllocation * 1.3);
      const recommendedSpend = totalBudget * recommendedAllocation;
      const spendIncrease = recommendedSpend - channel.totalSpend;

      recommendations.push({
        channel: channel.channel,
        current_spend: Math.round(channel.totalSpend),
        recommended_spend: Math.round(recommendedSpend),
        expected_revenue_increase: Math.round(spendIncrease * channel.efficiency),
        confidence: 0.85,
        reasoning: `High ROAS (${channel.efficiency.toFixed(2)}x) with ${channel.trend > 0 ? 'positive' : 'stable'} trend. Increase budget by ${Math.round((recommendedAllocation / currentAllocation - 1) * 100)}% for maximum ROI.`
      });
    } else if (channel.efficiency < 1.5 && channel.trend < 0) {
      recommendedAllocation = Math.max(0.05, currentAllocation * 0.7);
      const recommendedSpend = totalBudget * recommendedAllocation;

      recommendations.push({
        channel: channel.channel,
        current_spend: Math.round(channel.totalSpend),
        recommended_spend: Math.round(recommendedSpend),
        expected_revenue_increase: 0,
        confidence: 0.75,
        reasoning: `Low ROAS (${channel.efficiency.toFixed(2)}x) with declining trend. Reduce budget by ${Math.round((1 - recommendedAllocation / currentAllocation) * 100)}% and reallocate to higher-performing channels.`
      });
    }
  }

  return recommendations;
}

Deno.serve(async (req: Request) => {
  // Extract user's JWT from Authorization header for RLS
  const authHeader = req.headers.get('Authorization')!;
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { user_id, client_id, analysis_type = 'forecast' } = await req.json();

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { global: { headers: { Authorization: authHeader } } });

    const { data: metrics, error } = await supabase
      .from('marketing_channel_metrics')
      .select('metric_date, channel, spend, conversions, revenue')
      .eq('user_id', user_id)
      .gte('metric_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('metric_date', { ascending: true });

    if (error) throw error;

    if (!metrics || metrics.length === 0) {
      return new Response(JSON.stringify({
        error: 'Insufficient data for predictions. Need at least 7 days of historical data.'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      });
    }

    const aggregatedByDate: Record<string, CampaignMetrics> = {};
    const aggregatedByChannel: Record<string, CampaignMetrics[]> = {};

    for (const metric of metrics) {
      if (!aggregatedByDate[metric.metric_date]) {
        aggregatedByDate[metric.metric_date] = {
          date: metric.metric_date,
          spend: 0,
          conversions: 0,
          revenue: 0
        };
      }
      aggregatedByDate[metric.metric_date].spend += metric.spend || 0;
      aggregatedByDate[metric.metric_date].conversions += metric.conversions || 0;
      aggregatedByDate[metric.metric_date].revenue += metric.revenue || 0;

      if (!aggregatedByChannel[metric.channel]) {
        aggregatedByChannel[metric.channel] = [];
      }
      aggregatedByChannel[metric.channel].push({
        date: metric.metric_date,
        spend: metric.spend || 0,
        conversions: metric.conversions || 0,
        revenue: metric.revenue || 0
      });
    }

    const historicalData = Object.values(aggregatedByDate);

    if (analysis_type === 'forecast') {
      const predictions = predictNextDays(historicalData, 30);

      await supabase.from('campaign_predictions').upsert({
        user_id,
        client_id,
        prediction_date: new Date().toISOString().split('T')[0],
        predictions: predictions,
        model_type: 'linear_regression',
        confidence_score: 0.80
      });

      return new Response(JSON.stringify({
        predictions,
        historical_data: historicalData.slice(-30)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    } else if (analysis_type === 'optimize') {
      const totalBudget = historicalData
        .slice(-30)
        .reduce((sum, d) => sum + d.spend, 0);

      const recommendations = generateOptimizationRecommendations(
        aggregatedByChannel,
        totalBudget
      );

      return new Response(JSON.stringify({
        recommendations,
        current_monthly_budget: Math.round(totalBudget),
        potential_revenue_increase: recommendations.reduce((sum, r) => sum + r.expected_revenue_increase, 0)
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid analysis type' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    });
  } catch (error) {
    console.error('Predictive analytics error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Analysis failed'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    });
  }
});
