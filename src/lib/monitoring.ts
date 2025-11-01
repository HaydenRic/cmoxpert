// Production monitoring utilities
import * as Sentry from '@sentry/react';

// Initialize Sentry for production error reporting
export const initializeErrorReporting = () => {
  // Only initialize in production AND if Sentry DSN is configured
  if (!import.meta.env.PROD) {
    console.log('[MONITORING] Skipping Sentry initialization in development mode');
    return;
  }

  if (!import.meta.env.VITE_SENTRY_DSN) {
    console.log('[MONITORING] Sentry DSN not configured, skipping initialization');
    return;
  }

  try {
    console.log('[MONITORING] Initializing Sentry...');
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      integrations: [
        Sentry.browserTracingIntegration(),
      ],
      tracesSampleRate: 0.1, // Capture 10% of transactions for performance monitoring
      beforeSend(event) {
        // Filter out non-critical errors
        if (event.exception) {
          const error = event.exception.values?.[0];
          if (error?.type === 'ChunkLoadError' || error?.type === 'ResizeObserver loop limit exceeded') {
            return null; // Don't send these common, non-critical errors
          }
        }
        return event;
      },
    });
    console.log('[MONITORING] Sentry initialized successfully');
  } catch (error) {
    console.error('[MONITORING] Failed to initialize Sentry:', error);
  }
};

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  additionalData?: Record<string, any>;
}

// Enhanced error reporting function
export const reportError = (error: Error, additionalData?: Record<string, any>) => {
  if (import.meta.env.DEV) {
    console.error('Development Error:', error, additionalData);
    return;
  }

  // Send to Sentry if available
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
      Sentry.captureException(error);
    });
  } else {
    // Fallback error reporting
    const errorReport: ErrorReport = {
      message: error.message,
      stack: error.stack,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
      additionalData
    };

    console.error('Production Error Report:', errorReport);
    
    // You could also send to your own endpoint
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorReport)
    // }).catch(() => {}); // Silently fail if error reporting fails
  }
};

// Performance monitoring with enhanced error handling
export const measurePerformance = (name: string, fn: () => Promise<any>) => {
  return async (...args: any[]) => {
    const startTime = performance.now();
    
    try {
      const result = await fn.apply(null, args);
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Log performance metrics
      if (import.meta.env.DEV) {
        console.log(`Performance: ${name} took ${duration.toFixed(2)}ms`);
      }
      
      // Send to analytics in production
      if (import.meta.env.PROD && typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'timing_complete', {
          name: name,
          value: Math.round(duration)
        });
      }
      
      // Send to Sentry for performance monitoring
      if (import.meta.env.VITE_SENTRY_DSN) {
        Sentry.addBreadcrumb({
          message: `Performance: ${name}`,
          level: 'info',
          data: { duration: Math.round(duration) }
        });
      }
      
      return result;
    } catch (error) {
      reportError(error as Error, { operation: name, args });
      throw error;
    }
  };
};

// User session tracking with error handling
export const trackUserSession = () => {
  if (!import.meta.env.PROD) return;
  
  const sessionStart = Date.now();
  
  // Track session duration on page unload
  const handleBeforeUnload = () => {
    const sessionDuration = Date.now() - sessionStart;
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'session_duration', {
        value: Math.round(sessionDuration / 1000) // in seconds
      });
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // Cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
};

// Feature usage tracking with error handling
export const trackFeatureUsage = (feature: string, action: string, metadata?: Record<string, any>) => {
  try {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'feature_usage', {
        feature_name: feature,
        action: action,
        ...metadata
      });
    }

    // Add breadcrumb for debugging
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.addBreadcrumb({
        message: `Feature: ${feature} - ${action}`,
        level: 'info',
        data: metadata
      });
    }
  } catch (error) {
    // Silently fail for tracking errors
    console.warn('Failed to track feature usage:', error);
  }
};

// API call monitoring with enhanced error handling
export const monitorApiCall = async (
  apiName: string, 
  apiCall: () => Promise<any>
): Promise<any> => {
  const startTime = performance.now();
  
  try {
    const result = await apiCall();
    const duration = performance.now() - startTime;
    
    // Track successful API calls
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'api_call_success', {
        api_name: apiName,
        duration: Math.round(duration)
      });
    }
    
    // Add success breadcrumb
    if (import.meta.env.VITE_SENTRY_DSN) {
      Sentry.addBreadcrumb({
        message: `API Success: ${apiName}`,
        level: 'info',
        data: { duration: Math.round(duration) }
      });
    }
    
    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    
    // Track failed API calls
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'api_call_error', {
        api_name: apiName,
        duration: Math.round(duration),
        error_message: (error as Error).message
      });
    }
    
    reportError(error as Error, { apiName, duration });
    throw error;
  }
};

// Set user context for error reporting
export const setUserContext = (userId: string, email?: string) => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser({
      id: userId,
      email: email
    });
  }
};

// Clear user context (e.g., on logout)
export const clearUserContext = () => {
  if (import.meta.env.VITE_SENTRY_DSN) {
    Sentry.setUser(null);
  }
};