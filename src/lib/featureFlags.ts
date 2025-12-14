export const featureFlags = {
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true',
  ENABLE_AI: import.meta.env.VITE_ENABLE_AI === 'true',
  ENABLED_INTEGRATIONS: (import.meta.env.VITE_ENABLED_INTEGRATIONS || 'stripe,ga4').split(','),
} as const;

export function isIntegrationEnabled(type: string): boolean {
  return featureFlags.ENABLED_INTEGRATIONS.includes(type.toLowerCase());
}

export type IntegrationType = 'stripe' | 'ga4' | 'hubspot' | 'semrush' | 'facebook' | 'google_ads' | 'linkedin' | 'twitter' | 'mailchimp' | 'salesforce';
