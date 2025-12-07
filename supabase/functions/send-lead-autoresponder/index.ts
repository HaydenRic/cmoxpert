import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AutoresponderPayload {
  email: string;
  name?: string;
  company_name?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const payload: AutoresponderPayload = await req.json();

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@cmoxpert.com";

    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY not configured");
    }

    const firstName = payload.name?.split(" ")[0] || "there";

    const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Marketing Audit Results</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 40px; text-align: center;">
              <h1 style="margin: 0 0 10px 0; color: #ffffff; font-size: 28px; font-weight: 700;">
                Thanks for Your Audit Request!
              </h1>
              <p style="margin: 0; color: #e0e7ff; font-size: 16px;">
                We've analyzed your marketing performance
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <p style="margin: 0 0 25px 0; font-size: 18px; line-height: 28px; color: #111827;">
                Hi ${firstName},
              </p>

              <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 26px; color: #374151;">
                Thank you for using our free marketing audit tool. Your results have been generated and should be visible on your screen.
              </p>

              <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 26px; color: #374151;">
                Based on the information you provided, we've identified potential areas for optimization in your marketing strategy.
              </p>

              <!-- Key Benefits Box -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; background-color: #eff6ff; border-radius: 8px; border-left: 4px solid #3b82f6;">
                <tr>
                  <td style="padding: 25px;">
                    <h3 style="margin: 0 0 15px 0; color: #1e40af; font-size: 18px;">
                      What's Next?
                    </h3>
                    <ul style="margin: 0; padding-left: 20px; color: #374151; font-size: 15px; line-height: 24px;">
                      <li style="margin-bottom: 10px;">Review your audit results carefully</li>
                      <li style="margin-bottom: 10px;">Identify your top 3 optimization opportunities</li>
                      <li style="margin-bottom: 10px;">Consider how much budget you could save</li>
                      <li style="margin-bottom: 0;">Reach out if you'd like help implementing changes</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 26px; color: #374151;">
                Our team will review your audit within 24 hours. If we spot any immediate opportunities, we'll reach out with specific recommendations.
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="https://cmoxpert.com/packages" style="display: inline-block; padding: 16px 40px; background-color: #1e40af; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                      View Our Service Packages
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Stats -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; padding: 20px 0;">
                <tr>
                  <td style="width: 33%; text-align: center; padding: 10px;">
                    <div style="font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 5px;">75%</div>
                    <div style="font-size: 13px; color: #6b7280;">Avg. Client ROI Improvement</div>
                  </td>
                  <td style="width: 33%; text-align: center; padding: 10px; border-left: 1px solid #e5e7eb; border-right: 1px solid #e5e7eb;">
                    <div style="font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 5px;">10-15hrs</div>
                    <div style="font-size: 13px; color: #6b7280;">Saved Weekly on Reporting</div>
                  </td>
                  <td style="width: 33%; text-align: center; padding: 10px;">
                    <div style="font-size: 28px; font-weight: 700; color: #1e40af; margin-bottom: 5px;">50+</div>
                    <div style="font-size: 13px; color: #6b7280;">B2B SaaS Clients Served</div>
                  </td>
                </tr>
              </table>

              <p style="margin: 25px 0 0 0; font-size: 16px; line-height: 26px; color: #374151;">
                Questions? Just reply to this email—we're here to help!
              </p>

              <p style="margin: 25px 0 0 0; font-size: 16px; line-height: 26px; color: #374151;">
                Best regards,<br>
                <strong style="color: #111827;">The cmoxpert Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                <a href="https://cmoxpert.com" style="color: #1e40af; text-decoration: none; margin: 0 10px;">Website</a>
                <a href="https://cmoxpert.com/contact" style="color: #1e40af; text-decoration: none; margin: 0 10px;">Contact</a>
                <a href="https://cmoxpert.com/pricing" style="color: #1e40af; text-decoration: none; margin: 0 10px;">Pricing</a>
              </p>
              <p style="margin: 10px 0 0 0; font-size: 12px; color: #9ca3af;">
                © 2025 cmoxpert. All rights reserved.
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
        to: payload.email,
        subject: "Your Marketing Audit Results Are Ready",
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
