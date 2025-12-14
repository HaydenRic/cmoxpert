import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CheckoutRequest {
  email: string;
  priceId: string;
  tier: string;
  successUrl: string;
  cancelUrl: string;
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
    const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY");

    if (!STRIPE_SECRET_KEY) {
      throw new Error("Stripe API key not configured");
    }

    const { email, priceId, tier, successUrl, cancelUrl }: CheckoutRequest = await req.json();

    if (!email || !priceId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const checkoutSession = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        "customer_email": email,
        "line_items[0][price]": priceId,
        "line_items[0][quantity]": "1",
        "mode": "subscription",
        "success_url": successUrl,
        "cancel_url": cancelUrl,
        "metadata[tier]": tier,
        "metadata[email]": email,
        "allow_promotion_codes": "true",
        "billing_address_collection": "required",
        "payment_method_types[0]": "card",
        "subscription_data[metadata][tier]": tier,
      }),
    });

    if (!checkoutSession.ok) {
      const errorText = await checkoutSession.text();
      console.error("Stripe error:", errorText);
      throw new Error("Failed to create checkout session");
    }

    const session = await checkoutSession.json();

    return new Response(
      JSON.stringify({
        checkoutUrl: session.url,
        sessionId: session.id,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error creating checkout session:", error);

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
