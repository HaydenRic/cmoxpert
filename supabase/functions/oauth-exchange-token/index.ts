declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface TokenExchangeRequest {
  code: string;
  provider: 'google_ads' | 'meta_ads' | 'linkedin_ads';
  redirect_uri: string;
}

Deno.serve(async (req: Request) => {
  // (no Supabase client used here) — no auth header required
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { code, provider, redirect_uri }: TokenExchangeRequest = await req.json();

    let tokenUrl: string;
    let clientId: string;
    let clientSecret: string;

    switch (provider) {
      case 'google_ads':
        tokenUrl = 'https://oauth2.googleapis.com/token';
        clientId = Deno.env.get('GOOGLE_CLIENT_ID') || '';
        clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET') || '';
        break;
      case 'meta_ads':
        tokenUrl = 'https://graph.facebook.com/v18.0/oauth/access_token';
        clientId = Deno.env.get('META_APP_ID') || '';
        clientSecret = Deno.env.get('META_APP_SECRET') || '';
        break;
      case 'linkedin_ads':
        tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
        clientId = Deno.env.get('LINKEDIN_CLIENT_ID') || '';
        clientSecret = Deno.env.get('LINKEDIN_CLIENT_SECRET') || '';
        break;
      default:
        throw new Error('Unsupported provider');
    }

    const tokenParams = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirect_uri,
      grant_type: 'authorization_code'
    });

    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString()
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('Token exchange error:', errorData);
      throw new Error('Token exchange failed');
    }

    const tokenData = await tokenResponse.json();

    const expiresAt = tokenData.expires_in
      ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
      : null;

    return new Response(JSON.stringify({
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: expiresAt,
      scope: tokenData.scope || '',
      token_type: tokenData.token_type || 'Bearer'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200
    });
  } catch (error) {
    console.error('OAuth token exchange error:', error);
    return new Response(JSON.stringify({
      error: error.message || 'Token exchange failed'
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 400
    });
  }
});
