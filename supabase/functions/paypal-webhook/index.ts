import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

async function verifyPayPalWebhook(
  headers: Headers,
  body: string
): Promise<boolean> {
  try {
    const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
    const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
    const PAYPAL_WEBHOOK_ID = Deno.env.get("PAYPAL_WEBHOOK_ID");
    const PAYPAL_MODE = Deno.env.get("PAYPAL_MODE") || "sandbox";

    if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET || !PAYPAL_WEBHOOK_ID) {
      console.error("PayPal webhook configuration missing");
      return false;
    }

    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
    const baseUrl = PAYPAL_MODE === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!tokenResponse.ok) {
      console.error("Failed to get PayPal access token");
      return false;
    }

    const { access_token } = await tokenResponse.json();

    const verificationPayload = {
      auth_algo: headers.get("PAYPAL-AUTH-ALGO"),
      cert_url: headers.get("PAYPAL-CERT-URL"),
      transmission_id: headers.get("PAYPAL-TRANSMISSION-ID"),
      transmission_sig: headers.get("PAYPAL-TRANSMISSION-SIG"),
      transmission_time: headers.get("PAYPAL-TRANSMISSION-TIME"),
      webhook_id: PAYPAL_WEBHOOK_ID,
      webhook_event: JSON.parse(body),
    };

    const verifyResponse = await fetch(
      `${baseUrl}/v1/notifications/verify-webhook-signature`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(verificationPayload),
      }
    );

    if (!verifyResponse.ok) {
      console.error("PayPal webhook verification failed");
      return false;
    }

    const result = await verifyResponse.json();
    return result.verification_status === "SUCCESS";
  } catch (error) {
    console.error("Error verifying PayPal webhook:", error);
    return false;
  }
}

Deno.serve(async (req: Request) => {
  // Extract user's JWT from Authorization header for RLS
  const authHeader = req.headers.get('Authorization')!;
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey, { global: { headers: { Authorization: authHeader } } });

    const body = await req.text();
    const event = JSON.parse(body);

    const isValid = await verifyPayPalWebhook(req.headers, body);

    if (!isValid) {
      console.error("Invalid PayPal webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid webhook signature" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const eventType = event.event_type;
    const resource = event.resource;

    console.log("Processing PayPal webhook event:", eventType);

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.CREATED":
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        const customerId = resource.subscriber?.email_address;
        const subscriptionId = resource.id;
        const planId = resource.plan_id;
        const tier = resource.custom_id;

        const { data: profile } = await supabase
          .from("profiles")
          .select("id")
          .eq("email", customerId)
          .maybeSingle();

        if (profile) {
          await supabase
            .from("profiles")
            .update({
              subscription_tier: tier,
              subscription_status: "active",
              paypal_subscription_id: subscriptionId,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id);
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const subscriptionId = resource.id;

        await supabase
          .from("profiles")
          .update({
            subscription_status: "cancelled",
            updated_at: new Date().toISOString(),
          })
          .eq("paypal_subscription_id", subscriptionId);
        break;
      }

      case "BILLING.SUBSCRIPTION.UPDATED": {
        const subscriptionId = resource.id;
        const status = resource.status?.toLowerCase();

        await supabase
          .from("profiles")
          .update({
            subscription_status: status || "active",
            updated_at: new Date().toISOString(),
          })
          .eq("paypal_subscription_id", subscriptionId);
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        console.log("Payment completed:", resource.id);
        break;
      }

      default:
        console.log("Unhandled PayPal webhook event:", eventType);
    }

    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error processing PayPal webhook:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
