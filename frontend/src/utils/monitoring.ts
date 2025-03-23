import { onCLS, onFCP, onFID, onLCP, onTTFB } from 'web-vitals';

interface PerformanceMetrics {
  name: string;
  value: number;
  id?: string;
}

interface OfflineUsageData {
  startTime: number;
  endTime: number;
  actions: string[];
  syncedData: boolean;
}

export class MonitoringService {
  private offlineUsage: OfflineUsageData[] = [];
  private currentOfflineSession: OfflineUsageData | null = null;

  constructor() {
    this.initializeMonitoring();
  }

  private initializeMonitoring() {
    // Network monitoring
    window.addEventListener('online', () => {
      this.recordOfflineSession();
    });

    window.addEventListener('offline', () => {
      this.startOfflineSession();
    });

    // Error monitoring
    window.addEventListener('error', (event) => {
      this.handleError(event);
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event);
    });

    // Performance monitoring
    this.initializePerformanceMonitoring();
  }

  private initializePerformanceMonitoring() {
    // Track Web Vitals
    onFCP((metric) => this.handleFCP(metric));
    onLCP((metric) => this.handleLCP(metric));
    onFID((metric) => this.handleFID(metric));
    onCLS((metric) => this.handleCLS(metric));
    onTTFB((metric) => this.handleTTFB(metric));

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

  private handleFCP(metric: PerformanceMetrics) {
    this.trackPerformanceMetric('FCP', metric.value);
  }

  private handleLCP(metric: PerformanceMetrics) {
    this.trackPerformanceMetric('LCP', metric.value);
  }

  private handleFID(metric: PerformanceMetrics) {
    this.trackPerformanceMetric('FID', metric.value);
  }

  private handleCLS(metric: PerformanceMetrics) {
    this.trackPerformanceMetric('CLS', metric.value);
  }

  private handleTTFB(metric: PerformanceMetrics) {
    this.trackPerformanceMetric('TTFB', metric.value);
  }

  private trackServiceWorkerMetric(entry: PerformanceEntry) {
    if (entry.entryType === 'resource' && entry.name.includes('service-worker.js')) {
      this.trackPerformanceMetric('SW_Load_Time', entry.duration);
    }
  }

  private handleError(error: Error | ErrorEvent | PromiseRejectionEvent) {
    console.error('Error tracked:', error);
  }

  private trackPerformanceMetric(name: string, value: number) {
    console.log(`Performance metric - ${name}:`, value);
  }
}

export const monitoring = new MonitoringService(); 