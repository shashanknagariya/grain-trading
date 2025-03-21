import { useEffect } from 'react';
import { monitoring } from '../utils/monitoring';

export const useMonitoring = (componentName: string) => {
  useEffect(() => {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      monitoring.trackPerformanceMetric(`${componentName}_Duration`, duration);
    };
  }, [componentName]);

  return {
    trackAction: (action: string) => {
      if (!navigator.onLine) {
        monitoring.trackOfflineAction(`${componentName}:${action}`);
      }
    }
  };
}; 