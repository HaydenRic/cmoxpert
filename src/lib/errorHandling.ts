// Central re-export point for error handling utilities
export * from './errorTypes';
export * from './errorHandler';
export * from './offlineManager';
export * from './validationUtils';

import { NetworkMonitor } from './offlineManager';
import { ErrorHandler } from './errorHandler';

// Global error handler initialization
export const initializeErrorHandling = () => {
  // Only initialize in production
  if (!import.meta.env.PROD) {
    console.log('[ERROR_HANDLING] Skipping global error handlers in development mode');
    return;
  }

  console.log('[ERROR_HANDLING] Initializing error handling...');

  try {
    // Initialize network monitoring
    NetworkMonitor.init();
    console.log('[ERROR_HANDLING] Network monitor initialized');

    // Global unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      ErrorHandler.handleError(event.reason, {
        type: 'unhandled_promise_rejection',
        promise: event.promise
      });

      // Prevent the default browser behavior
      event.preventDefault();
    });

    // Global error handler
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
      ErrorHandler.handleError(event.error, {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    console.log('[ERROR_HANDLING] Error handling initialized successfully');
  } catch (error) {
    console.error('[ERROR_HANDLING] Failed to initialize error handling:', error);
  }
};