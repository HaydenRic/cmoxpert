// Central re-export point for error handling utilities
export * from './errorTypes';
export * from './errorHandler';
export * from './offlineManager';
export * from './validationUtils';

import { NetworkMonitor } from './offlineManager';
import { ErrorHandler } from './errorHandler';

// Global error handler initialization
export const initializeErrorHandling = () => {
  // Initialize network monitoring
  NetworkMonitor.init();

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

  console.log('Error handling initialized');
};