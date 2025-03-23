import { useEffect, useCallback } from 'react';
import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

interface PerformanceMetric {
  name: string;
  value: number;
  id?: string;
}

export const useMonitoring = (componentName: string) => {
  const trackMetric = useCallback((metric: PerformanceMetric) => {
    // Send metric to analytics or monitoring service
    console.log(`[${componentName}] ${metric.name}:`, metric.value);
  }, [componentName]);

  useEffect(() => {
    // Track Web Vitals
    onFCP(trackMetric);
    onLCP(trackMetric);
    onCLS(trackMetric);
    onFID(trackMetric);
    onTTFB(trackMetric);

    // Track component render time
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      trackMetric({
        name: 'render_duration',
        value: duration
      });
    };
  }, [trackMetric]);

  return {
    trackMetric
  };
}; 