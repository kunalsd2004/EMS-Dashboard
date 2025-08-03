// Google Analytics utility for EMS Dashboard
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

// Track page views
export const trackPageView = (page: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-08TSMDDBJT', {
      page_path: page,
    });
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track SOS alerts
export const trackSOSAlert = (alertId: string, location: string) => {
  trackEvent('sos_alert', 'emergency', location, 1);
};

// Track accident reports
export const trackAccidentReport = (reportId: string, severity: string) => {
  trackEvent('accident_report', 'reports', severity, 1);
};

// Track dashboard interactions
export const trackDashboardInteraction = (action: string, component: string) => {
  trackEvent(action, 'dashboard_interaction', component);
};

// Track map interactions
export const trackMapInteraction = (action: string, location: string) => {
  trackEvent(action, 'map_interaction', location);
};

// Track analytics page views
export const trackAnalyticsView = (filter: string) => {
  trackEvent('analytics_view', 'analytics', filter);
};

// Track user engagement
export const trackUserEngagement = (action: string, details: string) => {
  trackEvent(action, 'user_engagement', details);
}; 