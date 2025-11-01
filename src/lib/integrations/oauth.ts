import { supabase } from '../supabase';

export interface OAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authorizationUrl: string;
  tokenUrl: string;
}

export const OAUTH_CONFIGS = {
  google_ads: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/integrations/oauth/callback`,
    scopes: [
      'https://www.googleapis.com/auth/adwords',
      'https://www.googleapis.com/auth/analytics.readonly'
    ],
    authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token'
  },
  meta_ads: {
    clientId: import.meta.env.VITE_META_APP_ID || '',
    redirectUri: `${window.location.origin}/integrations/oauth/callback`,
    scopes: [
      'ads_read',
      'ads_management',
      'business_management'
    ],
    authorizationUrl: 'https://www.facebook.com/v18.0/dialog/oauth',
    tokenUrl: 'https://graph.facebook.com/v18.0/oauth/access_token'
  },
  linkedin_ads: {
    clientId: import.meta.env.VITE_LINKEDIN_CLIENT_ID || '',
    redirectUri: `${window.location.origin}/integrations/oauth/callback`,
    scopes: [
      'r_ads',
      'r_ads_reporting',
      'rw_ads'
    ],
    authorizationUrl: 'https://www.linkedin.com/oauth/v2/authorization',
    tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken'
  }
};

// Generate PKCE code verifier and challenge
function generateCodeVerifier(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

export function generateOAuthUrl(
  provider: 'google_ads' | 'meta_ads' | 'linkedin_ads',
  state: string,
  codeChallenge?: string
): string {
  const config = OAUTH_CONFIGS[provider];

  const params: Record<string, string> = {
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state: state,
    access_type: 'offline',
    prompt: 'consent'
  };

  // Add PKCE for Google OAuth (best practice)
  if (provider === 'google_ads' && codeChallenge) {
    params.code_challenge = codeChallenge;
    params.code_challenge_method = 'S256';
  }

  const searchParams = new URLSearchParams(params);
  return `${config.authorizationUrl}?${searchParams.toString()}`;
}

export async function initiateOAuthFlow(
  provider: 'google_ads' | 'meta_ads' | 'linkedin_ads',
  userId: string,
  clientId?: string
): Promise<string> {
  // Generate PKCE code verifier and challenge
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  // Generate cryptographically secure state with CSRF token
  const csrfToken = crypto.randomUUID();
  const state = btoa(JSON.stringify({
    provider,
    userId,
    clientId,
    timestamp: Date.now(),
    nonce: crypto.randomUUID(),
    csrf: csrfToken
  }));

  // Store state and PKCE verifier in database with shorter expiration (5 minutes)
  const { error } = await supabase
    .from('oauth_states')
    .insert({
      state,
      provider,
      user_id: userId,
      client_id: clientId,
      code_verifier: codeVerifier,
      csrf_token: csrfToken,
      expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() // 5 minutes
    });

  if (error) {
    throw new Error('Failed to initiate OAuth flow');
  }

  return generateOAuthUrl(provider, state, codeChallenge);
}

export async function handleOAuthCallback(
  code: string,
  state: string
): Promise<{ success: boolean; integrationId?: string; error?: string }> {
  try {
    // Validate state format
    let stateData;
    try {
      stateData = JSON.parse(atob(state));
    } catch {
      return { success: false, error: 'Invalid state format' };
    }

    // Verify state exists in database and hasn't been used (prevents replay attacks)
    const { data: stateRecord, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .eq('used', false)
      .maybeSingle();

    if (stateError || !stateRecord) {
      return { success: false, error: 'Invalid or already used state' };
    }

    // Verify state hasn't expired
    if (new Date(stateRecord.expires_at) < new Date()) {
      // Clean up expired state
      await supabase.from('oauth_states').delete().eq('state', state);
      return { success: false, error: 'OAuth state expired' };
    }

    // Verify CSRF token matches
    if (stateRecord.csrf_token !== stateData.csrf) {
      return { success: false, error: 'CSRF token mismatch' };
    }

    // Verify user matches
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user.id !== stateData.userId) {
      return { success: false, error: 'User mismatch' };
    }

    // Mark state as used immediately to prevent replay
    await supabase
      .from('oauth_states')
      .update({ used: true })
      .eq('state', state);

    // Exchange code for tokens via Edge Function
    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-exchange-token`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionData.session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        provider: stateData.provider,
        redirect_uri: OAUTH_CONFIGS[stateData.provider as keyof typeof OAUTH_CONFIGS].redirectUri,
        code_verifier: stateRecord.code_verifier // Pass PKCE verifier
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Token exchange failed' };
    }

    const tokenData = await response.json();

    // Save integration with encrypted tokens (handled by database)
    const { data: integration, error: integrationError } = await supabase
      .from('integrations')
      .insert({
        user_id: stateData.userId,
        client_id: stateData.clientId,
        service_name: stateData.provider,
        service_type: stateData.provider === 'google_ads' ? 'ads' : 'ads',
        status: 'active',
        config: {
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: tokenData.expires_at,
          scopes: tokenData.scope
        },
        last_sync_at: new Date().toISOString()
      })
      .select()
      .single();

    if (integrationError) {
      return { success: false, error: 'Failed to save integration' };
    }

    // Clean up used state
    await supabase
      .from('oauth_states')
      .delete()
      .eq('state', state);

    return { success: true, integrationId: integration.id };
  } catch (error) {
    console.error('OAuth callback error:', error);
    return { success: false, error: 'Unexpected error during OAuth callback' };
  }
}
