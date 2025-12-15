import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PayPalSubscriptionRequest {
  email: string;
  name: string;
  planId: string;
  tier: string;
  successUrl: string;
  cancelUrl: string;
}

async function getPayPalAccessToken(): Promise<string> {
  const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
  const PAYPAL_CLIENT_SECRET = Deno.env.get("PAYPAL_CLIENT_SECRET");
  const PAYPAL_MODE = Deno.env.get("PAYPAL_MODE") || "sandbox";

  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    throw new Error("PayPal credentials not configured");
  }

  const baseUrl = PAYPAL_MODE === "production"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);

  const response = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("PayPal auth error:", errorText);
    throw new Error("Failed to authenticate with PayPal");
  }

  const data = await response.json();
  return data.access_token;
}

Deno.serve(async (req: Request) => {
  // (no Supabase client used here) — no auth header required
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, name, planId, tier, successUrl, cancelUrl }: PayPalSubscriptionRequest = await req.json();

    if (!email || !planId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const accessToken = await getPayPalAccessToken();
    const PAYPAL_MODE = Deno.env.get("PAYPAL_MODE") || "sandbox";
    const baseUrl = PAYPAL_MODE === "production"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

    const subscriptionPayload = {
      plan_id: planId,
      subscriber: {
        name: {
          given_name: name.split(' ')[0] || name,
          surname: name.split(' ').slice(1).join(' ') || name,
        },
        email_address: email,
      },
      application_context: {
        brand_name: "cmoxpert",
        locale: "en-US",
        shipping_preference: "NO_SHIPPING",
        user_action: "SUBSCRIBE_NOW",
        payment_method: {
          payer_selected: "PAYPAL",
          payee_preferred: "IMMEDIATE_PAYMENT_REQUIRED",
        },
        return_url: successUrl,
        cancel_url: cancelUrl,
      },
      custom_id: tier,
    };

    const subscriptionResponse = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Prefer": "return=representation",
      },
      body: JSON.stringify(subscriptionPayload),
    });

    if (!subscriptionResponse.ok) {
      const errorText = await subscriptionResponse.text();
      console.error("PayPal subscription error:", errorText);
      throw new Error("Failed to create PayPal subscription");
    }

    const subscription = await subscriptionResponse.json();

    const approvalLink = subscription.links?.find((link: any) => link.rel === "approve");

    if (!approvalLink) {
      throw new Error("No approval link found in PayPal response");
    }

    return new Response(
      JSON.stringify({
        approvalUrl: approvalLink.href,
        subscriptionId: subscription.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating PayPal subscription:", error);

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
