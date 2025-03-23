interface PWAEvent {
  type: string;
  category: string;
  action: string;
  label?: string;
  value?: number;
  timestamp?: number;
}

class PWAAnalytics {
  private endpoint = '/api/analytics';
  private events: PWAEvent[] = [];
  private flushInterval: number = 5000; // Flush every 5 seconds
  private isOffline = !navigator.onLine;

  constructor() {
    this.setupPeriodicFlush();
    this.setupBeforeUnloadFlush();
    this.setupOfflineDetection();
  }

  private setupPeriodicFlush() {
    setInterval(() => this.flush(), this.flushInterval);
  }

  private setupBeforeUnloadFlush() {
    window.addEventListener('beforeunload', () => this.flush());
  }

  private setupOfflineDetection() {
    window.addEventListener('online', () => {
      this.isOffline = false;
      this.syncEvents();
    });

    window.addEventListener('offline', () => {
      this.isOffline = true;
    });
  }

  trackEvent(event: PWAEvent) {
    this.events.push({
      ...event,
      timestamp: Date.now()
    });

    if (!this.isOffline) {
      this.sendEvent(event);
    }
  }

  private async sendEvent(event: PWAEvent) {
    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      });
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  private async syncEvents() {
    const unsentEvents = [...this.events];
    this.events = [];

    for (const event of unsentEvents) {
      await this.sendEvent(event);
    }
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
      type: 'installation',
      category: 'PWA',
      action: 'install'
    });
  }

  trackOfflineUsage() {
    this.trackEvent({
      type: 'usage',
      category: 'Offline',
      action: 'usage'
    });
  }

  trackPerformance(metric: string, value: number) {
    this.trackEvent({
      type: 'performance',
      category: 'Performance',
      action: metric,
      value
    });
  }
}

export const analytics = new PWAAnalytics(); 