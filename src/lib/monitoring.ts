// Production monitoring utilities

interface ErrorReport {
  message: string;
  stack?: string;
  url: string;
  userAgent: string;
  timestamp: number;
  userId?: string;
  additionalData?: Record<string, any>;
}

// Error reporting function
export const reportError = (error: Error, additionalData?: Record<string, any>) => {
  if (!import.meta.env.PROD) {
    console.error('Development Error:', error, additionalData);
    return;
  }

  const errorReport: ErrorReport = {
    message: error.message,
    stack: error.stack,
    url: window.location.href,
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
    additionalData
  };

  // In production, send to error reporting service
  // Example: Sentry, LogRocket, Bugsnag, etc.
  console.error('Production Error Report:', errorReport);
  
  // You could also send to your own endpoint
  // fetch('/api/errors', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(errorReport)
  // });
};

// Performance monitoring
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
      
      return result;
    } catch (error) {
      reportError(error as Error, { operation: name, args });
      throw error;
    }
  };
};

// User session tracking
export const trackUserSession = () => {
  if (!import.meta.env.PROD) return;
  
  const sessionStart = Date.now();
  
  // Track session duration on page unload
  window.addEventListener('beforeunload', () => {
    const sessionDuration = Date.now() - sessionStart;
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'session_duration', {
        value: Math.round(sessionDuration / 1000) // in seconds
      });
    }
  });
};

// Feature usage tracking
export const trackFeatureUsage = (feature: string, action: string, metadata?: Record<string, any>) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'feature_usage', {
      feature_name: feature,
      action: action,
      ...metadata
    });
  }
};

// API call monitoring
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