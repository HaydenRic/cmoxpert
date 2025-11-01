import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeErrorReporting } from './lib/monitoring';
import { initializeErrorHandling } from './lib/errorHandling';

console.log('[INIT] Starting application initialization...');
console.log('[INIT] Environment:', import.meta.env.MODE);
console.log('[INIT] Supabase URL configured:', !!import.meta.env.VITE_SUPABASE_URL);

// Initialize error handling first (only in production)
if (import.meta.env.PROD) {
  console.log('[INIT] Initializing error handling (production mode)...');
  initializeErrorReporting();
  initializeErrorHandling();
} else {
  console.log('[INIT] Skipping Sentry initialization in development mode');
}

console.log('[INIT] Mounting React app...');
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('[INIT] ERROR: Root element not found!');
  throw new Error('Root element not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log('[INIT] React app mounted successfully');