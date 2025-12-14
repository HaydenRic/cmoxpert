/*
  # Google OAuth Callback Edge Function

  Handles the OAuth callback from Google after user authorizes access.
  Exchanges the authorization code for access and refresh tokens.
  Stores tokens securely in the database.
*/

import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
const googleRedirectUri = Deno.env.get('GOOGLE_REDIRECT_URI');

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  token_type: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user from JWT token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { code } = await req.json();

    if (!code) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization code' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!googleClientId || !googleClientSecret || !googleRedirectUri) {
      return new Response(
        JSON.stringify({ error: 'Google OAuth not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: googleClientId,
        client_secret: googleClientSecret,
        redirect_uri: googleRedirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokens: TokenResponse = await tokenResponse.json();

    // Calculate token expiry
    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + tokens.expires_in);

    // Store tokens in database (upsert to handle reconnections)
    const { error: dbError } = await supabase
      .from('google_oauth_tokens')
      .upsert({
        user_id: user.id,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_expiry: tokenExpiry.toISOString(),
        scope: tokens.scope,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (dbError) {
      throw new Error(`Failed to store tokens: ${dbError.message}`);
    }

    // Fetch user's Search Console properties
    const propertiesResponse = await fetch(
      'https://www.googleapis.com/webmasters/v3/sites',
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
        },
      }
    );

    if (!propertiesResponse.ok) {
      throw new Error('Failed to fetch Search Console properties');
    }

    const propertiesData = await propertiesResponse.json();
    const properties = propertiesData.siteEntry || [];

    // Store properties in database
    for (const property of properties) {
      await supabase
        .from('google_search_console_properties')
        .upsert({
          user_id: user.id,
          property_url: property.siteUrl,
          permission_level: property.permissionLevel,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,property_url',
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Google Search Console connected successfully',
        properties: properties.map((p: any) => ({
          url: p.siteUrl,
          permission: p.permissionLevel,
        })),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('OAuth callback error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to complete OAuth flow',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
