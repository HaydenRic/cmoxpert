import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeErrorReporting } from './lib/monitoring';
import { initializeErrorHandling } from './lib/errorHandling';

// Initialize error reporting for production
initializeErrorReporting();

// Initialize comprehensive error handling
initializeErrorHandling();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
