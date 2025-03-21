interface PWAEvent {
  category: 'PWA' | 'Offline' | 'Performance';
  action: string;
  label?: string;
  value?: number;
}

class PWAAnalytics {
  private endpoint = '/api/analytics';
  private events: PWAEvent[] = [];
  private flushInterval: number = 5000; // Flush every 5 seconds

  constructor() {
    this.setupPeriodicFlush();
    this.setupBeforeUnloadFlush();
  }

  private setupPeriodicFlush() {
    setInterval(() => this.flush(), this.flushInterval);
  }

  private setupBeforeUnloadFlush() {
    window.addEventListener('beforeunload', () => this.flush());
  }

  trackEvent(event: PWAEvent) {
    this.events.push({
      ...event,
      timestamp: Date.now()
    });
  }

  async flush() {
    if (this.events.length === 0) return;

    try {
      const eventsToSend = [...this.events];
      this.events = [];

      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ events: eventsToSend })
      });
    } catch (error) {
      // If failed, add events back to queue
      this.events = [...this.events, ...this.events];
    }
  }

  trackInstallation() {
    this.trackEvent({
      category: 'PWA',
      action: 'install'
    });
  }

  trackOfflineUsage() {
    this.trackEvent({
      category: 'Offline',
      action: 'usage'
    });
  }

  trackPerformance(metric: string, value: number) {
    this.trackEvent({
      category: 'Performance',
      action: metric,
      value
    });
  }
}

export const analytics = new PWAAnalytics(); 