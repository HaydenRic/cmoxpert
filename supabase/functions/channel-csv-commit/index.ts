import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.78.0";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CommitRow {
  date: string;
  channel: string;
  spend?: number;
  clicks?: number;
  impressions?: number;
  conversions?: number;
  leads?: number;
  sqls?: number;
  opps?: number;
  revenue?: number;
  notes?: string;
}

// CommitResult removed (unused)

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { clientId, filename, csvContent } = await req.json();

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
      Deno.env.get("SUPABASE_ANON_KEY") || "",
    { global: { headers: { Authorization: authHeader } } }
    );

    const lines = csvContent.trim().split("\n").filter((l: string) => l.trim());
    const headers = lines[0].split(",").map((h: string) => h.trim().toLowerCase());

    const rows: CommitRow[] = [];
    const errors: string[] = [];
    let rowsFailed = 0;

    // Parse CSV rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v: string) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h: string, idx: number) => {
        row[h] = values[idx] || "";
      });

      try {
        // Validate required fields
        if (!row["date"] || !row["channel"]) {
          errors.push(`Row ${i + 1}: Missing date or channel`);
          rowsFailed++;
          continue;
        }

        // Validate date format
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(row["date"])) {
          errors.push(`Row ${i + 1}: Invalid date format`);
          rowsFailed++;
          continue;
        }

        // Parse numeric fields
        const commitRow: CommitRow = {
          date: row["date"],
          channel: row["channel"].toLowerCase(),
        };

        const numericFields = ["spend", "clicks", "impressions", "conversions", "leads", "sqls", "opps", "revenue"];
        numericFields.forEach((field) => {
          if (row[field]) {
            const num = parseFloat(row[field]);
            if (!isNaN(num)) {
              commitRow[field as keyof CommitRow] = num as never;
            }
          }
        });

        if (row["notes"]) {
          commitRow.notes = row["notes"];
        }

        rows.push(commitRow);
      } catch (err) {
        errors.push(`Row ${i + 1}: ${String(err)}`);
        rowsFailed++;
      }
    }

    if (rows.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          rowsInserted: 0,
          rowsFailed,
          errors: errors.length > 0 ? errors : ["No valid rows to insert"],
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Upsert into channel_metrics_daily
    const metricsToInsert = rows.map((r) => ({
      client_id: clientId,
      metric_date: r.date,
      channel: r.channel,
      spend: r.spend || 0,
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      conversions: r.conversions || 0,
      leads: r.leads || 0,
      sqls: r.sqls || 0,
      opps: r.opps || 0,
      revenue: r.revenue || 0,
      notes: r.notes || null,
    }));

    const { data: insertedData, error: insertError } = await supabase
      .from("channel_metrics_daily")
      .upsert(metricsToInsert, {
        onConflict: "client_id,metric_date,channel",
      })
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      errors.push(`Database insert failed: ${insertError.message}`);
      return new Response(
        JSON.stringify({
          success: false,
          rowsInserted: 0,
          rowsFailed: rows.length,
          errors,
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log import to data_imports table
    const { data: authData } = await supabase.auth.getUser();
    const userId = authData?.user?.id;

    if (userId) {
      await supabase.from("data_imports").insert({
        client_id: clientId,
        import_type: "channel_metrics_csv",
        filename: filename || "imported.csv",
        rows_inserted: insertedData?.length || rows.length,
        rows_failed: rowsFailed,
        error_summary: errors.length > 0 ? errors.slice(0, 3).join("; ") : null,
        error_details: errors.length > 0 ? { errors } : null,
        created_by: userId,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        rowsInserted: insertedData?.length || rows.length,
        rowsFailed,
        errors: errors.length > 0 ? errors : [],
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("CSV commit error:", error);
    return new Response(
      JSON.stringify({ error: `Commit failed: ${String(error)}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
