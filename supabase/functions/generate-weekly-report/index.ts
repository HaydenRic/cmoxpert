import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.78.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ReportData {
  clientName: string;
  reportPeriod: string;
  totalSpend: number;
  totalRevenue: number;
  totalConversions: number;
  totalClicks: number;
  averageROAS: number;
  topChannels: Array<{ channel: string; spend: number; revenue: number; roas: number }>;
  dailyMetrics: Array<{
    date: string;
    spend: number;
    revenue: number;
    conversions: number;
  }>;
  gscData?: {
    totalClicks: number;
    totalImpressions: number;
    averageCTR: number;
    averagePosition: number;
  };
  insights: string[];
}

async function fetchWeeklyMetrics(
  supabase: ReturnType<typeof createClient>,
  clientId: string,
  days: number = 7
): Promise<ReportData | null> {
  const endDate = new Date();
  const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

  // Fetch client name
  const { data: clientData } = await supabase
    .from("clients")
    .select("name")
    .eq("id", clientId)
    .maybeSingle();

  if (!clientData) return null;

  // Fetch channel metrics
  const { data: metricsData } = await supabase
    .from("channel_metrics_daily")
    .select("*")
    .eq("client_id", clientId)
    .gte("metric_date", startDate.toISOString().split("T")[0])
    .lte("metric_date", endDate.toISOString().split("T")[0])
    .order("metric_date", { ascending: true });

  if (!metricsData || metricsData.length === 0) {
    return null;
  }

  // Calculate aggregations
  let totalSpend = 0;
  let totalRevenue = 0;
  let totalConversions = 0;
  let totalClicks = 0;
  const channelStats: Record<
    string,
    { spend: number; revenue: number; conversions: number; clicks: number }
  > = {};
  const dailyMetrics: Array<{ date: string; spend: number; revenue: number; conversions: number }> =
    [];

  metricsData.forEach((metric) => {
    const spend = metric.spend || 0;
    const revenue = metric.revenue || 0;
    const conversions = metric.conversions || 0;
    const clicks = metric.clicks || 0;

    totalSpend += spend;
    totalRevenue += revenue;
    totalConversions += conversions;
    totalClicks += clicks;

    if (!channelStats[metric.channel]) {
      channelStats[metric.channel] = { spend: 0, revenue: 0, conversions: 0, clicks: 0 };
    }
    channelStats[metric.channel].spend += spend;
    channelStats[metric.channel].revenue += revenue;
    channelStats[metric.channel].conversions += conversions;
    channelStats[metric.channel].clicks += clicks;

    // Find or create daily metric
    const existing = dailyMetrics.find((d) => d.date === metric.metric_date);
    if (existing) {
      existing.spend += spend;
      existing.revenue += revenue;
      existing.conversions += conversions;
    } else {
      dailyMetrics.push({
        date: metric.metric_date,
        spend,
        revenue,
        conversions,
      });
    }
  });

  // Calculate top channels
  const topChannels = Object.entries(channelStats)
    .map(([channel, stats]) => ({
      channel,
      spend: stats.spend,
      revenue: stats.revenue,
      roas: stats.spend > 0 ? stats.revenue / stats.spend : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const averageROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;

  // Try to fetch GSC data
  let gscData;
  try {
    const { data: gscRaw } = await supabase
      .from("google_search_console_data")
      .select("clicks,impressions,ctr,position")
      .eq(
        "property_id",
        (
          await supabase
            .from("google_search_console_properties")
            .select("id")
            .eq("client_id", clientId)
            .maybeSingle()
        ).data?.id || ""
      )
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0]);

    if (gscRaw && gscRaw.length > 0) {
      const totalGscClicks = gscRaw.reduce((sum, row) => sum + (row.clicks || 0), 0);
      const totalImpressions = gscRaw.reduce((sum, row) => sum + (row.impressions || 0), 0);
      const avgCtr = gscRaw.reduce((sum, row) => sum + (row.ctr || 0), 0) / gscRaw.length;
      const avgPosition = gscRaw.reduce((sum, row) => sum + (row.position || 0), 0) / gscRaw.length;

      gscData = {
        totalClicks: totalGscClicks,
        totalImpressions,
        averageCTR: avgCtr,
        averagePosition: avgPosition,
      };
    }
  } catch (err) {
    console.log("GSC data not available");
  }

  // Generate insights
  const insights: string[] = [];

  if (totalSpend > 0) {
    insights.push(`Total spend: $${totalSpend.toFixed(2)}`);
  }

  if (totalRevenue > 0) {
    insights.push(`Total revenue: $${totalRevenue.toFixed(2)}`);
    insights.push(`ROAS: ${averageROAS.toFixed(2)}x`);
  }

  if (topChannels.length > 0) {
    insights.push(`Top channel: ${topChannels[0].channel} ($${topChannels[0].revenue.toFixed(2)} revenue)`);
  }

  if (totalConversions > 0) {
    insights.push(`Total conversions: ${totalConversions}`);
    if (totalClicks > 0) {
      const convRate = ((totalConversions / totalClicks) * 100).toFixed(2);
      insights.push(`Conversion rate: ${convRate}%`);
    }
  }

  if (gscData) {
    insights.push(`GSC impressions: ${gscData.totalImpressions.toLocaleString()}`);
    insights.push(`Average GSC position: ${gscData.averagePosition.toFixed(1)}`);
  }

  const reportPeriod = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

  return {
    clientName: clientData.name,
    reportPeriod,
    totalSpend,
    totalRevenue,
    totalConversions,
    totalClicks,
    averageROAS,
    topChannels,
    dailyMetrics,
    gscData,
    insights,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { clientId, days = 7, format = "json" } = await req.json();

    if (!clientId) {
      return new Response(
        JSON.stringify({ error: "clientId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    );

    const reportData = await fetchWeeklyMetrics(supabase, clientId, days);

    if (!reportData) {
      return new Response(
        JSON.stringify({ error: "No metrics found for this client" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (format === "json") {
      return new Response(JSON.stringify(reportData), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // For PDF format, return HTML that can be rendered/printed
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Weekly Report - ${reportData.clientName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .container { max-width: 900px; margin: 0 auto; background: white; padding: 40px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { margin-bottom: 30px; border-bottom: 3px solid #2563eb; padding-bottom: 20px; }
    .header h1 { margin: 0 0 10px 0; color: #1f2937; }
    .header p { margin: 0; color: #6b7280; }
    .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 30px 0; }
    .kpi { background: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #2563eb; }
    .kpi-label { font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
    .kpi-value { font-size: 32px; font-weight: 700; color: #1f2937; margin-top: 8px; }
    .section { margin: 40px 0; }
    .section h2 { font-size: 20px; color: #1f2937; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; }
    .insight-list { list-style: none; padding: 0; }
    .insight-list li { padding: 12px 0; color: #374151; border-bottom: 1px solid #e5e7eb; }
    .insight-list li:before { content: '→ '; color: #2563eb; font-weight: bold; margin-right: 8px; }
    .channel-table { width: 100%; border-collapse: collapse; }
    .channel-table th { text-align: left; padding: 12px; background: #f3f4f6; font-weight: 600; color: #374151; border-bottom: 2px solid #e5e7eb; }
    .channel-table td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
    .channel-table tr:nth-child(even) { background: #f9fafb; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; color: #6b7280; font-size: 12px; text-align: center; }
    @media print { body { background: white; } .container { box-shadow: none; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Weekly Performance Report</h1>
      <p>${reportData.clientName} • ${reportData.reportPeriod}</p>
    </div>

    <div class="kpi-grid">
      <div class="kpi">
        <div class="kpi-label">Total Spend</div>
        <div class="kpi-value">$${reportData.totalSpend.toFixed(0)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Total Revenue</div>
        <div class="kpi-value">$${reportData.totalRevenue.toFixed(0)}</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">ROAS</div>
        <div class="kpi-value">${reportData.averageROAS.toFixed(2)}x</div>
      </div>
      <div class="kpi">
        <div class="kpi-label">Conversions</div>
        <div class="kpi-value">${reportData.totalConversions}</div>
      </div>
    </div>

    ${
      reportData.topChannels.length > 0
        ? `
    <div class="section">
      <h2>Top Performing Channels</h2>
      <table class="channel-table">
        <thead>
          <tr>
            <th>Channel</th>
            <th>Spend</th>
            <th>Revenue</th>
            <th>ROAS</th>
          </tr>
        </thead>
        <tbody>
          ${reportData.topChannels
            .map(
              (ch) => `
          <tr>
            <td><strong>${ch.channel}</strong></td>
            <td>$${ch.spend.toFixed(2)}</td>
            <td>$${ch.revenue.toFixed(2)}</td>
            <td>${ch.roas.toFixed(2)}x</td>
          </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
    `
        : ""
    }

    <div class="section">
      <h2>Key Insights</h2>
      <ul class="insight-list">
        ${reportData.insights.map((insight) => `<li>${insight}</li>`).join("")}
      </ul>
    </div>

    <div class="footer">
      <p>Generated on ${new Date().toLocaleString()}</p>
    </div>
  </div>
</body>
</html>
    `;

    return new Response(html, {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" },
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return new Response(
      JSON.stringify({ error: `Report failed: ${String(error)}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
