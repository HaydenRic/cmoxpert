import { useEffect } from 'react';

interface PerformanceMetrics {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

export function PerformanceMonitor() {
  useEffect(() => {
    // Only run in production
    if (!import.meta.env.PROD) return;

    const metrics: PerformanceMetrics = {};

    // Measure Core Web Vitals
    const measureWebVitals = () => {
      // First Contentful Paint
      const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0] as PerformanceEntry;
      if (fcpEntry) {
        metrics.fcp = fcpEntry.startTime;
      }

      // Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        metrics.ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
      }

      // Largest Contentful Paint
      if ('PerformanceObserver' in window) {
        try {
          const lcpObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            metrics.lcp = lastEntry.startTime;
          });
          lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

          // First Input Delay
          const fidObserver = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              metrics.fid = entry.processingStart - entry.startTime;
            });
          });
          fidObserver.observe({ entryTypes: ['first-input'] });

          // Cumulative Layout Shift
          const clsObserver = new PerformanceObserver((list) => {
            let clsValue = 0;
            const entries = list.getEntries();
            entries.forEach((entry: any) => {
              if (!entry.hadRecentInput) {
                clsValue += entry.value;
              }
            });
            metrics.cls = clsValue;
          });
          clsObserver.observe({ entryTypes: ['layout-shift'] });

          // Send metrics after page load
          setTimeout(() => {
            sendMetrics(metrics);
          }, 5000);
        } catch (error) {
          console.warn('Performance monitoring not supported:', error);
        }
      }
    };

    // Send metrics to analytics
    const sendMetrics = (metrics: PerformanceMetrics) => {
      // Send to Google Analytics if available
      if (typeof window !== 'undefined' && (window as any).gtag) {
        Object.entries(metrics).forEach(([metric, value]) => {
          if (value !== undefined) {
            (window as any).gtag('event', 'web_vitals', {
              metric_name: metric,
              metric_value: Math.round(value),
              custom_parameter: 'core_web_vitals'
            });
          }
        });
      }

      // Log to console in development
      if (import.meta.env.DEV) {
        console.log('Performance Metrics:', metrics);
      }

      // In production, you might send to a monitoring service
      // Example: sendToMonitoringService(metrics);
    };

    // Start measuring when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', measureWebVitals);
    } else {
      measureWebVitals();
    }

    return () => {
      document.removeEventListener('DOMContentLoaded', measureWebVitals);
    };
  }, []);

  return null;
}

// Utility function to measure custom performance metrics
export const measureCustomMetric = (name: string, startTime: number) => {
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  if (import.meta.env.DEV) {
    console.log(`Custom metric ${name}: ${duration.toFixed(2)}ms`);
  }

  // Send to analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'custom_timing', {
      name: name,
      value: Math.round(duration)
    });
  }

  return duration;
};