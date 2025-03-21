import { test, expect } from '@playwright/test';

test.describe('PWA Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should install as PWA', async ({ page }) => {
    // Check for install prompt
    const installButton = await page.waitForSelector('[data-testid="pwa-install-button"]');
    expect(installButton).toBeTruthy();
  });

  test('should work offline', async ({ page, context }) => {
    // Load initial data
    await page.waitForSelector('[data-testid="dashboard-content"]');
    
    // Go offline
    await context.setOffline(true);
    
    // Try navigation
    await page.click('[data-testid="inventory-link"]');
    const inventoryTitle = await page.textContent('h1');
    expect(inventoryTitle).toContain('Inventory');
    
    // Try offline data submission
    await page.fill('[data-testid="grain-name"]', 'Test Grain');
    await page.click('[data-testid="submit-button"]');
    const offlineIndicator = await page.textContent('[data-testid="offline-indicator"]');
    expect(offlineIndicator).toContain('Saved offline');
  });

  test('should handle push notifications', async ({ page }) => {
    // Check notification permission
    const permissionStatus = await page.evaluate(() => Notification.permission);
    expect(['granted', 'default']).toContain(permissionStatus);
  });
}); 