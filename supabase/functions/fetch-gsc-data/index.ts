/*
  # Fetch Google Search Console Data Edge Function

  Fetches performance data from Google Search Console for a specific property.
  Handles token refresh if needed and stores data in the database.
*/

import { corsHeaders } from '../_shared/cors.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

declare const Deno: {
  env: { get(name: string): string | undefined };
  serve(handler: (req: Request) => Promise<Response> | Response): void;
};

const googleClientId = Deno.env.get('GOOGLE_CLIENT_ID');
const googleClientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');

interface RequestPayload {
  propertyId: string;
  startDate: string;
  endDate: string;
}

interface GSCRow {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    // Extract user's JWT from Authorization header for RLS
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

    const supabase = createClient(supabaseUrl, supabaseServiceKey, { global: { headers: { Authorization: authHeader } } });

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

    const { propertyId, startDate, endDate }: RequestPayload = await req.json();

    if (!propertyId || !startDate || !endDate) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: propertyId, startDate, endDate' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get property details and verify ownership
    const { data: property, error: propertyError } = await supabase
      .from('google_search_console_properties')
      .select('*')
      .eq('id', propertyId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (propertyError || !property) {
      return new Response(
        JSON.stringify({ error: 'Property not found or access denied' }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get OAuth tokens
    const { data: tokenData, error: tokenError } = await supabase
      .from('google_oauth_tokens')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (tokenError || !tokenData) {
      return new Response(
        JSON.stringify({ error: 'Google Search Console not connected' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Check if token is expired and refresh if needed
    let accessToken = tokenData.access_token;
    const tokenExpiry = new Date(tokenData.token_expiry);
    const now = new Date();

    if (now >= tokenExpiry) {
      // Refresh the token
      accessToken = await refreshAccessToken(supabase, user.id, tokenData.refresh_token);
    }

    // Fetch overall performance data
    const performanceData = await fetchGSCPerformance(
      property.property_url,
      accessToken,
      startDate,
      endDate
    );

    // Fetch top queries
    const queryData = await fetchGSCQueries(
      property.property_url,
      accessToken,
      startDate,
      endDate
    );

    // Fetch top pages
    const pageData = await fetchGSCPages(
      property.property_url,
      accessToken,
      startDate,
      endDate
    );

    // Fetch country data
    const countryData = await fetchGSCCountries(
      property.property_url,
      accessToken,
      startDate,
      endDate
    );

    // Fetch device data
    const deviceData = await fetchGSCDevices(
      property.property_url,
      accessToken,
      startDate,
      endDate
    );

    // Store data in database (one record per date range for now)
    const { error: insertError } = await supabase
      .from('google_search_console_data')
      .upsert({
        property_id: propertyId,
        date: endDate,
        clicks: performanceData.clicks || 0,
        impressions: performanceData.impressions || 0,
        ctr: performanceData.ctr || 0,
        position: performanceData.position || 0,
        query_data: queryData,
        page_data: pageData,
        country_data: countryData,
        device_data: deviceData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'property_id,date',
      });

    if (insertError) {
      throw new Error(`Failed to store GSC data: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'GSC data fetched successfully',
        data: {
          clicks: performanceData.clicks,
          impressions: performanceData.impressions,
          ctr: performanceData.ctr,
          position: performanceData.position,
          topQueries: queryData.length,
          topPages: pageData.length,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error fetching GSC data:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to fetch GSC data',
        details: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// Refresh access token using refresh token
async function refreshAccessToken(supabase: any, userId: string, refreshToken: string): Promise<string> {
  if (!googleClientId || !googleClientSecret) {
    throw new Error('Google OAuth not configured');
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: googleClientId,
      client_secret: googleClientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to refresh access token');
  }

  const data = await response.json();
  const tokenExpiry = new Date();
  tokenExpiry.setSeconds(tokenExpiry.getSeconds() + data.expires_in);

  // Update tokens in database
  await supabase
    .from('google_oauth_tokens')
    .update({
      access_token: data.access_token,
      token_expiry: tokenExpiry.toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId);

  return data.access_token;
}

// Fetch overall performance data
async function fetchGSCPerformance(propertyUrl: string, accessToken: string, startDate: string, endDate: string) {
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: [],
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`GSC API error: ${response.status}`);
  }

  const data = await response.json();
  const row = data.rows?.[0] || {};

  return {
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  };
}

// Fetch top queries
async function fetchGSCQueries(propertyUrl: string, accessToken: string, startDate: string, endDate: string) {
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['query'],
        rowLimit: 25,
      }),
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return (data.rows || []).map((row: GSCRow) => ({
    query: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));
}

// Fetch top pages
async function fetchGSCPages(propertyUrl: string, accessToken: string, startDate: string, endDate: string) {
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['page'],
        rowLimit: 25,
      }),
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return (data.rows || []).map((row: GSCRow) => ({
    page: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
    ctr: row.ctr || 0,
    position: row.position || 0,
  }));
}

// Fetch country data
async function fetchGSCCountries(propertyUrl: string, accessToken: string, startDate: string, endDate: string) {
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['country'],
        rowLimit: 10,
      }),
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return (data.rows || []).map((row: GSCRow) => ({
    country: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
  }));
}

// Fetch device data
async function fetchGSCDevices(propertyUrl: string, accessToken: string, startDate: string, endDate: string) {
  const response = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(propertyUrl)}/searchAnalytics/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ['device'],
      }),
    }
  );

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  return (data.rows || []).map((row: GSCRow) => ({
    device: row.keys?.[0] || '',
    clicks: row.clicks || 0,
    impressions: row.impressions || 0,
  }));
}
