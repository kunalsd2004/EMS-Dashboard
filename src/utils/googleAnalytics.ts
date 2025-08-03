// Google Analytics utility functions
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

// Get Google Analytics Measurement ID from environment
const GA_MEASUREMENT_ID = process.env.REACT_APP_GA_MEASUREMENT_ID || 'GA_MEASUREMENT_ID';

// Track page views
export const trackPageView = (pageTitle: string, pagePath: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title: pageTitle,
      page_path: pagePath,
      custom_map: {
        'custom_dimension1': 'user_type',
        'custom_dimension2': 'page_section'
      }
    });
  }
};

// Track custom events
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value
    });
  }
};

// Track user interactions
export const trackUserInteraction = (interaction: string, details?: any) => {
  trackEvent('user_interaction', 'engagement', interaction);
  
  if (details) {
    console.log('User interaction tracked:', { interaction, details });
  }
};

// Track dashboard section views
export const trackDashboardSection = (section: string) => {
  trackEvent('section_view', 'dashboard', section);
  trackPageView(`EMS Dashboard - ${section}`, `/${section.toLowerCase()}`);
};

// Track SOS alerts
export const trackSOSAlert = (alertType: string, location?: string) => {
  trackEvent('sos_alert', 'emergency', alertType, 1);
  
  if (location) {
    trackEvent('sos_location', 'emergency', location);
  }
};

// Track report generation
export const trackReportGeneration = (reportType: string) => {
  trackEvent('report_generated', 'analytics', reportType);
};

// Track map interactions
export const trackMapInteraction = (interaction: string, coordinates?: { lat: number, lng: number }) => {
  trackEvent('map_interaction', 'map', interaction);
  
  if (coordinates) {
    trackEvent('map_coordinates', 'map', `${coordinates.lat},${coordinates.lng}`);
  }
};

// Track user login/logout
export const trackUserAuth = (action: 'login' | 'logout', userType?: string) => {
  trackEvent('user_auth', 'authentication', action);
  
  if (userType) {
    trackEvent('user_type', 'authentication', userType);
  }
};

// Track performance metrics
export const trackPerformance = (metric: string, value: number) => {
  trackEvent('performance', 'metrics', metric, value);
};

// Initialize analytics for the app
export const initializeAnalytics = () => {
  if (typeof window !== 'undefined') {
    // Track initial page load
    trackPageView('EMS Dashboard', window.location.pathname);
    
    // Track user agent and screen size
    const userAgent = navigator.userAgent;
    const screenSize = `${window.screen.width}x${window.screen.height}`;
    
    trackEvent('page_load', 'performance', 'initial_load');
    trackEvent('device_info', 'system', userAgent);
    trackEvent('screen_size', 'system', screenSize);
  }
}; 