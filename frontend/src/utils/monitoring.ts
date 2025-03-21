interface PerformanceMetrics {
  fcp: number;  // First Contentful Paint
  lcp: number;  // Largest Contentful Paint
  fid: number;  // First Input Delay
  cls: number;  // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

interface OfflineUsageData {
  startTime: number;
  endTime: number;
  actions: string[];
  syncedData: boolean;
}

class MonitoringService {
  private offlineUsage: OfflineUsageData[] = [];
  private isOffline = !navigator.onLine;

  constructor() {
    this.setupOfflineTracking();
    this.setupPerformanceTracking();
  }

  private setupOfflineTracking() {
    window.addEventListener('online', () => {
      this.isOffline = false;
      this.recordOfflineSession();
    });

    window.addEventListener('offline', () => {
      this.isOffline = true;
      this.startOfflineSession();
    });
  }

  private setupPerformanceTracking() {
    // Track Web Vitals
    if ('web-vitals' in window) {
      webVitals.onFCP(this.handleFCP.bind(this));
      webVitals.onLCP(this.handleLCP.bind(this));
      webVitals.onFID(this.handleFID.bind(this));
      webVitals.onCLS(this.handleCLS.bind(this));
      webVitals.onTTFB(this.handleTTFB.bind(this));
    }

    // Track Service Worker Performance
    if ('performance' in window) {
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.trackServiceWorkerMetric(entry);
        }
      });

      observer.observe({ entryTypes: ['resource', 'navigation'] });
    }
  }

  private currentOfflineSession: OfflineUsageData | null = null;

  private startOfflineSession() {
    this.currentOfflineSession = {
      startTime: Date.now(),
      endTime: 0,
      actions: [],
      syncedData: false
    };
  }

  private recordOfflineSession() {
    if (this.currentOfflineSession) {
      this.currentOfflineSession.endTime = Date.now();
      this.offlineUsage.push(this.currentOfflineSession);
      this.sendOfflineAnalytics(this.currentOfflineSession);
      this.currentOfflineSession = null;
    }
  }

  trackOfflineAction(action: string) {
    if (this.currentOfflineSession) {
      this.currentOfflineSession.actions.push(action);
    }
  }

  private async sendOfflineAnalytics(session: OfflineUsageData) {
    try {
      await fetch('/api/analytics/offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(session)
      });
    } catch (error) {
      console.error('Failed to send offline analytics:', error);
    }
  }

  // Web Vitals Handlers
  private handleFCP(metric: any) {
    this.trackPerformanceMetric('FCP', metric.value);
  }

  private handleLCP(metric: any) {
    this.trackPerformanceMetric('LCP', metric.value);
  }

  private handleFID(metric: any) {
    this.trackPerformanceMetric('FID', metric.value);
  }

  private handleCLS(metric: any) {
    this.trackPerformanceMetric('CLS', metric.value);
  }

  private handleTTFB(metric: any) {
    this.trackPerformanceMetric('TTFB', metric.value);
  }

  private trackServiceWorkerMetric(entry: PerformanceEntry) {
    if (entry.entryType === 'resource' && entry.name.includes('service-worker.js')) {
      this.trackPerformanceMetric('SW_Load_Time', entry.duration);
    }
  }

  private async trackPerformanceMetric(name: string, value: number) {
    try {
      await fetch('/api/analytics/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ metric: name, value })
      });
    } catch (error) {
      console.error('Failed to send performance metric:', error);
    }
  }
}

export const monitoring = new MonitoringService(); 