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

export function generateOAuthUrl(
  provider: 'google_ads' | 'meta_ads' | 'linkedin_ads',
  state: string
): string {
  const config = OAUTH_CONFIGS[provider];

  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(' '),
    response_type: 'code',
    state: state,
    access_type: 'offline',
    prompt: 'consent'
  });

  return `${config.authorizationUrl}?${params.toString()}`;
}

export async function initiateOAuthFlow(
  provider: 'google_ads' | 'meta_ads' | 'linkedin_ads',
  userId: string,
  clientId?: string
): Promise<string> {
  const state = btoa(JSON.stringify({
    provider,
    userId,
    clientId,
    timestamp: Date.now(),
    nonce: crypto.randomUUID()
  }));

  const { error } = await supabase
    .from('oauth_states')
    .insert({
      state,
      provider,
      user_id: userId,
      client_id: clientId,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString()
    });

  if (error) {
    throw new Error('Failed to initiate OAuth flow');
  }

  return generateOAuthUrl(provider, state);
}

export async function handleOAuthCallback(
  code: string,
  state: string
): Promise<{ success: boolean; integrationId?: string; error?: string }> {
  try {
    const stateData = JSON.parse(atob(state));

    const { data: stateRecord, error: stateError } = await supabase
      .from('oauth_states')
      .select('*')
      .eq('state', state)
      .maybeSingle();

    if (stateError || !stateRecord) {
      return { success: false, error: 'Invalid or expired state' };
    }

    if (new Date(stateRecord.expires_at) < new Date()) {
      return { success: false, error: 'OAuth state expired' };
    }

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/oauth-exchange-token`;
    const { data: sessionData } = await supabase.auth.getSession();

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sessionData.session?.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        provider: stateData.provider,
        redirect_uri: OAUTH_CONFIGS[stateData.provider as keyof typeof OAUTH_CONFIGS].redirectUri
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Token exchange failed' };
    }

    const tokenData = await response.json();

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
