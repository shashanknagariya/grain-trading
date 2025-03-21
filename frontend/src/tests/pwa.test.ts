import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { analytics } from '../utils/analytics';
import { dbService } from '../utils/indexedDB';

describe('PWA Features', () => {
  describe('Service Worker', () => {
    it('should register service worker', async () => {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      expect(registration.active).toBeTruthy();
    });

    it('should handle offline mode', async () => {
      // Simulate offline
      await network.offline();
      const response = await fetch('/api/health');
      expect(response.ok).toBeTruthy();
      // Restore online
      await network.online();
    });
  });

  describe('IndexedDB Storage', () => {
    beforeEach(async () => {
      await dbService.initDB();
    });

    afterEach(async () => {
      await dbService.clearAll();
    });

    it('should store data offline', async () => {
      const testData = { id: 1, name: 'Test' };
      await dbService.add('grains', testData);
      const stored = await dbService.get('grains', 1);
      expect(stored).toEqual(testData);
    });
  });

  describe('Push Notifications', () => {
    it('should request permission', async () => {
      const permission = await Notification.requestPermission();
      expect(permission).toBe('granted');
    });

    it('should handle push events', async () => {
      const pushEvent = new PushEvent('push', {
        data: new TextEncoder().encode(JSON.stringify({
          title: 'Test',
          body: 'Test notification'
        }))
      });
      await self.dispatchEvent(pushEvent);
      // Check if notification was shown
      expect(self.registration.showNotification).toHaveBeenCalled();
    });
  });

  describe('Analytics', () => {
    it('should track events', () => {
      analytics.trackEvent({
        category: 'PWA',
        action: 'test',
        label: 'test'
      });
      expect(analytics.flush).toHaveBeenCalled();
    });
  });
}); 