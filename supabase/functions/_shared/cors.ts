// CORS configuration for Edge Functions
// In production, update Access-Control-Allow-Origin to your specific domain(s)
// For now using '*' for development compatibility

const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://cmoxpert.com',
  'https://www.cmoxpert.com',
  'https://kgtiverynmxizyguklfr.supabase.co'
];

export function getCorsHeaders(origin?: string): Record<string, string> {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Access-Control-Max-Age': '86400',
  };
}

// Backward compatibility - default to first allowed origin
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // TODO: Update to specific domain in production
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
  'Access-Control-Max-Age': '86400',
};
