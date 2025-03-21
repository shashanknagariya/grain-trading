interface ServiceWorkerMetric {
  type: 'registration' | 'activation' | 'fetch' | 'sync' | 'push' | 'error';
  status: 'success' | 'failure';
  timestamp: number;
  duration?: number;
  details?: any;
}

class ServiceWorkerMonitor {
  private metrics: ServiceWorkerMetric[] = [];
  private readonly FLUSH_INTERVAL = 60000; // 1 minute

  constructor() {
    this.setupMonitoring();
    this.setupPeriodicFlush();
  }

  private setupMonitoring() {
    if ('serviceWorker' in navigator) {
      // Monitor registration
      this.trackRegistration();
      
      // Monitor service worker state changes
      this.trackStateChanges();
      
      // Monitor service worker messages
      this.trackMessages();
      
      // Monitor service worker errors
      this.trackErrors();
    }
  }

  private trackRegistration() {
    navigator.serviceWorker.ready.then(() => {
      this.addMetric('registration', 'success');
    }).catch(error => {
      this.addMetric('registration', 'failure', { error: error.message });
    });
  }

  private trackStateChanges() {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      this.addMetric('activation', 'success');
    });
  }

  private trackMessages() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data.type === 'SYNC_COMPLETED') {
        this.addMetric('sync', 'success', event.data.payload);
      } else if (event.data.type === 'PUSH_RECEIVED') {
        this.addMetric('push', 'success', event.data.payload);
      }
    });
  }

  private trackErrors() {
    window.addEventListener('unhandledrejection', (event) => {
      if (event.reason?.toString().includes('ServiceWorker')) {
        this.addMetric('error', 'failure', { error: event.reason.toString() });
      }
    });
  }

  private addMetric(type: ServiceWorkerMetric['type'], status: ServiceWorkerMetric['status'], details?: any) {
    const metric: ServiceWorkerMetric = {
      type,
      status,
      timestamp: Date.now(),
      details
    };
    this.metrics.push(metric);
  }

  private setupPeriodicFlush() {
    setInterval(() => this.flushMetrics(), this.FLUSH_INTERVAL);
  }

  private async flushMetrics() {
    if (this.metrics.length === 0) return;

    try {
      const metricsToSend = [...this.metrics];
      this.metrics = [];

      await fetch('/api/analytics/sw-metrics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(metricsToSend)
      });
    } catch (error) {
      console.error('Failed to send metrics:', error);
      // Add back failed metrics
      this.metrics = [...this.metrics, ...this.metrics];
    }
  }

  // Public methods for manual tracking
  trackFetchEvent(url: string, duration: number, success: boolean) {
    this.addMetric('fetch', success ? 'success' : 'failure', { url, duration });
  }

  trackSyncEvent(tag: string, success: boolean) {
    this.addMetric('sync', success ? 'success' : 'failure', { tag });
  }

  trackPushEvent(title: string, success: boolean) {
    this.addMetric('push', success ? 'success' : 'failure', { title });
  }
}

export const swMonitor = new ServiceWorkerMonitor(); 