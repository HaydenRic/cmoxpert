import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AuditNotificationPayload {
  email: string;
  company_name: string;
  website?: string;
  monthly_ad_spend: number;
  score: number;
  estimated_waste: number;
}

Deno.serve(async (req: Request) => {
  // Extract user's JWT from Authorization header for RLS
  const authHeader = req.headers.get('Authorization')!;
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    // Extract user's JWT from Authorization header for RLS
    const authHeader = req.headers.get('Authorization')!;
    const payload: AuditNotificationPayload = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const ADMIN_EMAIL = Deno.env.get("ADMIN_EMAIL") || "admin@cmoxpert.com";
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@cmoxpert.com";

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    // Format currency
    const formatCurrency = (cents: number) => {
      return new Intl.NumberFormat("en-GB", {
        style: "currency",
        currency: "GBP",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(cents / 100);
    };

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Marketing Audit Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                🎯 New Marketing Audit Submission
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #374151;">
                A new marketing audit has been submitted. Here are the details:
              </p>

              <!-- Lead Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                <tr>
                  <td style="padding: 15px 20px; background-color: #f9fafb; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #111827;">
                    Lead Information
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px;">
                    <strong style="color: #374151;">Email:</strong><br>
                    <span style="color: #1e40af; font-size: 16px;">${payload.email}</span>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 15px 20px; background-color: #f9fafb;">
                    <strong style="color: #374151;">Company:</strong><br>
                    <span style="color: #111827;">${payload.company_name || "Not provided"}</span>
                  </td>
                </tr>
                ${
                  payload.website
                    ? `
                <tr>
                  <td style="padding: 15px 20px;">
                    <strong style="color: #374151;">Website:</strong><br>
                    <a href="${payload.website}" style="color: #1e40af; text-decoration: none;">${payload.website}</a>
                  </td>
                </tr>
                `
                    : ""
                }
              </table>

              <!-- Audit Results -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="padding: 15px 20px; background-color: #fef3c7; border-radius: 8px; text-align: center;">
                    <div style="font-size: 14px; color: #92400e; margin-bottom: 5px;">Marketing Health Score</div>
                    <div style="font-size: 48px; font-weight: 700; color: ${
                      payload.score >= 70 ? "#059669" : payload.score >= 50 ? "#d97706" : "#dc2626"
                    };">
                      ${payload.score}
                    </div>
                  </td>
                </tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                <tr>
                  <td style="width: 48%; padding: 15px; background-color: #fee2e2; border-radius: 8px;">
                    <div style="font-size: 12px; color: #991b1b; margin-bottom: 5px;">Monthly Spend</div>
                    <div style="font-size: 24px; font-weight: 700; color: #dc2626;">
                      ${formatCurrency(payload.monthly_ad_spend)}
                    </div>
                  </td>
                  <td style="width: 4%;"></td>
                  <td style="width: 48%; padding: 15px; background-color: #fee2e2; border-radius: 8px;">
                    <div style="font-size: 12px; color: #991b1b; margin-bottom: 5px;">Estimated Waste</div>
                    <div style="font-size: 24px; font-weight: 700; color: #dc2626;">
                      ${formatCurrency(payload.estimated_waste)}
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 30px 0 20px 0;">
                    <a href="https://app.cmoxpert.com/admin" style="display: inline-block; padding: 14px 32px; background-color: #1e40af; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      View in Admin Dashboard
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 20px; color: #6b7280; text-align: center;">
                Follow up within 24 hours for best conversion rates.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0; font-size: 12px; color: #6b7280;">
                cmoxpert • Marketing Intelligence Platform
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `;

    // Send email via Resend
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: ADMIN_EMAIL,
        subject: `🎯 New Audit: ${payload.company_name || payload.email} (Score: ${payload.score})`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      throw new Error(`Resend API error: ${error}`);
    }

    const data = await res.json();

    return new Response(JSON.stringify({ success: true, email_id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error sending email:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
