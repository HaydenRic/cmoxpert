import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// Google Analytics 4 implementation
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface AnalyticsProps {
  trackingId?: string;
}

export function Analytics({ trackingId }: AnalyticsProps) {
  const location = useLocation();

  useEffect(() => {
    if (!trackingId || typeof window === 'undefined') return;

    // Initialize Google Analytics
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${trackingId}', {
        page_title: document.title,
        page_location: window.location.href,
      });
    `;
    document.head.appendChild(script2);

    return () => {
      document.head.removeChild(script1);
      document.head.removeChild(script2);
    };
  }, [trackingId]);

  // Track page views
  useEffect(() => {
    if (!trackingId || typeof window === 'undefined' || !window.gtag) return;

    window.gtag('config', trackingId, {
      page_title: document.title,
      page_location: window.location.href,
      page_path: location.pathname + location.search,
    });
  }, [location, trackingId]);

  return null;
}

// Custom event tracking functions
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};

export const trackConversion = (conversionId: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: conversionId,
      value: value,
      currency: 'GBP'
    });
  }
};

// Track form submissions
export const trackFormSubmission = (formName: string, formData?: Record<string, any>) => {
  trackEvent('form_submit', {
    form_name: formName,
    ...formData
  });
};

// Track video plays
export const trackVideoPlay = (videoTitle: string, videoId?: string) => {
  trackEvent('video_play', {
    video_title: videoTitle,
    video_id: videoId
  });
};

// Track client actions
export const trackClientAction = (action: string, clientName?: string) => {
  trackEvent('client_action', {
    action: action,
    client_name: clientName
  });
};