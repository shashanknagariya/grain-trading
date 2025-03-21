import { useEffect, useCallback } from 'react';
import { swMonitor } from '../utils/serviceWorkerMonitoring';

export const useServiceWorkerMonitoring = () => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      swMonitor.trackFetchEvent(window.location.pathname, duration, true);
    };
  }, []);

  const trackEvent = useCallback((type: string, success: boolean, details?: any) => {
    switch (type) {
      case 'sync':
        swMonitor.trackSyncEvent(details?.tag || 'unknown', success);
        break;
      case 'push':
        swMonitor.trackPushEvent(details?.title || 'unknown', success);
        break;
      default:
        console.warn('Unknown event type:', type);
    }
  }, []);

  return { trackEvent };
}; 