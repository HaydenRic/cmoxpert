import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface ValidationRow {
  rowNumber: number;
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
  errors?: string[];
}

interface ValidationResult {
  valid: boolean;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  preview: ValidationRow[];
  errors: string[];
}

const VALID_CHANNELS = [
  "organic_search",
  "paid_search",
  "social_organic",
  "paid_social",
  "email",
  "direct",
  "referral",
  "content",
  "events",
  "partner",
  "affiliate",
  "display",
  "video",
  "other",
];

Deno.serve(async (req: Request) => {
  // Extract user's JWT from Authorization header for RLS
  const authHeader = req.headers.get('Authorization')!;
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { csvContent } = await req.json();

    if (!csvContent || typeof csvContent !== "string") {
      return new Response(
        JSON.stringify({ error: "csvContent is required and must be a string" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const lines = csvContent.trim().split("\n").filter((l) => l.trim());

    if (lines.length < 2) {
      return new Response(
        JSON.stringify({ error: "CSV must have at least a header row and one data row" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const headerLine = lines[0];
    const headers = headerLine.split(",").map((h) => h.trim().toLowerCase());

    const requiredHeaders = ["date", "channel"];
    const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h));

    if (missingHeaders.length > 0) {
      return new Response(
        JSON.stringify({
          error: `CSV must have columns: ${requiredHeaders.join(", ")}. Missing: ${missingHeaders.join(", ")}`,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const result: ValidationResult = {
      valid: true,
      totalRows: lines.length - 1,
      validRows: 0,
      invalidRows: 0,
      preview: [],
      errors: [],
    };

    for (let i = 1; i < lines.length && result.preview.length < 50; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim());
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] || "";
      });

      const validationRow: ValidationRow = {
        rowNumber: i + 1,
        date: row["date"] || "",
        channel: row["channel"] || "",
        errors: [],
      };

      // Validate date
      if (!row["date"]) {
        validationRow.errors?.push("Date is required");
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(row["date"])) {
          validationRow.errors?.push(`Invalid date format: ${row["date"]} (use YYYY-MM-DD)`);
        } else {
          const dateObj = new Date(row["date"]);
          if (isNaN(dateObj.getTime())) {
            validationRow.errors?.push(`Invalid date: ${row["date"]}`);
          } else {
            validationRow.date = row["date"];
          }
        }
      }

      // Validate channel
      if (!row["channel"]) {
        validationRow.errors?.push("Channel is required");
      } else if (!VALID_CHANNELS.includes(row["channel"].toLowerCase())) {
        validationRow.errors?.push(
          `Invalid channel: ${row["channel"]}. Valid channels: ${VALID_CHANNELS.join(", ")}`
        );
      } else {
        validationRow.channel = row["channel"].toLowerCase();
      }

      // Parse numeric fields
      const numericFields = ["spend", "clicks", "impressions", "conversions", "leads", "sqls", "opps", "revenue"];
      numericFields.forEach((field) => {
        if (row[field]) {
          const num = parseFloat(row[field]);
          if (isNaN(num)) {
            validationRow.errors?.push(`${field} must be a number, got: ${row[field]}`);
          } else {
            validationRow[field as keyof ValidationRow] = num as never;
          }
        }
      });

      // Include notes if present
      if (row["notes"]) {
        validationRow.notes = row["notes"];
      }

      // Check validity
      if (!validationRow.errors || validationRow.errors.length === 0) {
        result.validRows++;
        delete validationRow.errors;
      } else {
        result.invalidRows++;
        result.valid = false;
      }

      result.preview.push(validationRow);
    }

    // Build error summary if there are invalid rows
    if (result.invalidRows > 0) {
      result.errors.push(
        `${result.invalidRows} of ${result.totalRows} rows have errors. Check preview for details.`
      );
    }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("CSV validation error:", error);
    return new Response(
      JSON.stringify({ error: `Validation failed: ${String(error)}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
