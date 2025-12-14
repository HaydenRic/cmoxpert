import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.78.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { clientId, csvContent } = await req.json();

    if (!clientId || !csvContent) {
      return new Response(
        JSON.stringify({ error: "clientId and csvContent are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

        // Extract user's JWT from Authorization header for RLS
    const authHeader = req.headers.get('Authorization')!;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_ANON_KEY") || ""
    ,
    { global: { headers: { Authorization: authHeader } } });

    const lines = csvContent.trim().split("\n");
    if (lines.length < 2) {
      return new Response(
        JSON.stringify({ error: "CSV must have at least a header row and one data row" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headers = lines[0].split(",").map((h: string) => h.trim());
    const requiredHeaders = ["metric_name", "metric_date", "value"];
    const hasRequiredHeaders = requiredHeaders.every(h => headers.includes(h));

    if (!hasRequiredHeaders) {
      return new Response(
        JSON.stringify({ error: `CSV must have columns: ${requiredHeaders.join(", ")}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const syncRunId = crypto.randomUUID();
    let rowsProcessed = 0;
    const errors: string[] = [];

    const { error: syncError } = await supabase
      .from("sync_runs")
      .insert({
        id: syncRunId,
        client_id: clientId,
        type: "csv_import",
        status: "running",
      });

    if (syncError) {
      console.error("Failed to create sync_run:", syncError);
      throw syncError;
    }

    const metricsToInsert = [];
    const rawEventsToInsert = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v: string) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h: string, idx: number) => {
        row[h] = values[idx] || "";
      });

      try {
        const metricDate = new Date(row.metric_date);
        if (isNaN(metricDate.getTime())) {
          errors.push(`Row ${i + 1}: Invalid date format`);
          continue;
        }

        const valueNum = parseFloat(row.value);
        if (isNaN(valueNum)) {
          errors.push(`Row ${i + 1}: Invalid value`);
          continue;
        }

        const metric = {
          client_id: clientId,
          metric_name: row.metric_name,
          metric_date: row.metric_date,
          value: valueNum,
          source: "csv",
        };

        metricsToInsert.push(metric);
        rawEventsToInsert.push({
          client_id: clientId,
          source: "csv",
          event_type: "metric_recorded",
          payload: metric,
          event_time: new Date(row.metric_date).toISOString(),
        });

        rowsProcessed++;
      } catch (err) {
        errors.push(`Row ${i + 1}: ${String(err)}`);
      }
    }

    if (metricsToInsert.length > 0) {
      const { error: insertError } = await supabase
        .from("metrics_daily")
        .upsert(metricsToInsert, {
          onConflict: "client_id,metric_name,metric_date,source",
        });

      if (insertError) {
        console.error("Failed to insert metrics:", insertError);
        throw insertError;
      }

      await supabase.from("raw_events").insert(rawEventsToInsert);
    }

    await supabase
      .from("sync_runs")
      .update({
        status: "success",
        ended_at: new Date().toISOString(),
        rows_processed: rowsProcessed,
        error: errors.length > 0 ? errors.join("; ") : null,
      })
      .eq("id", syncRunId);

    return new Response(
      JSON.stringify({
        success: true,
        rowsProcessed,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("CSV import error:", error);
    return new Response(
      JSON.stringify({ error: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
