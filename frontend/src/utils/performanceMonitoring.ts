// Temporarily disabled performance monitoring
/*
interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: Partial<PerformanceMetrics> = {};

  constructor() {
    this.initializeObservers();
  }

  private initializeObservers() {
    // FCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        this.metrics.fcp = entries[0].startTime;
        this.reportMetrics();
      }
    }).observe({ type: 'paint', buffered: true });

    // LCP
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        this.metrics.lcp = entries[entries.length - 1].startTime;
        this.reportMetrics();
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });

    // FID
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      if (entries.length > 0) {
        this.metrics.fid = entries[0].processingStart - entries[0].startTime;
        this.reportMetrics();
      }
    }).observe({ type: 'first-input', buffered: true });

    // CLS
    new PerformanceObserver((entryList) => {
      let clsValue = 0;
      for (const entry of entryList.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += (entry as any).value;
        }
      }
      this.metrics.cls = clsValue;
      this.reportMetrics();
    }).observe({ type: 'layout-shift', buffered: true });

    // TTFB
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigation) {
      this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
    }
  }

  private reportMetrics() {
    // Send metrics to analytics or monitoring service
    console.log('Performance Metrics:', this.metrics);
  }

  public getMetrics(): Partial<PerformanceMetrics> {
    return { ...this.metrics };
  }
}

export const performanceMonitor = new PerformanceMonitor();
*/

export const PerformanceMonitoring = {
  // Minimal implementation
  init: () => {}
}; 