import { test, expect } from '@playwright/test';
import { DEVICE_CONFIGS } from '../src/utils/deviceTestUtils';

test.describe('Device-specific testing', () => {
  for (const [device, config] of Object.entries(DEVICE_CONFIGS)) {
    test.describe(device, () => {
      test.use({ ...config });

      test('navigation works correctly', async ({ page }) => {
        await page.goto('/');
        
        if (config.isMobile) {
          // Test mobile navigation
          const menuButton = await page.locator('button[aria-label="menu"]');
          await expect(menuButton).toBeVisible();
          await menuButton.click();
          
          const drawer = await page.locator('role=dialog');
          await expect(drawer).toBeVisible();
        } else {
          // Test desktop navigation
          const sidebar = await page.locator('role=complementary');
          await expect(sidebar).toBeVisible();
        }
      });

      test('touch interactions work on mobile devices', async ({ page }) => {
        if (config.hasTouch) {
          await page.goto('/');
          
          // Test swipe gesture
          await page.touchscreen.tap(10, 100);
          await page.touchscreen.move(200, 100);
          await page.touchscreen.up();
          
          const drawer = await page.locator('role=dialog');
          await expect(drawer).toBeVisible();
        }
      });

      test('form inputs are properly sized', async ({ page }) => {
        await page.goto('/purchases/new');
        
        const input = await page.locator('input[name="quantity"]');
        const { height } = await input.boundingBox();
        
        if (config.isMobile) {
          expect(height).toBeGreaterThanOrEqual(48); // Mobile touch target size
        } else {
          expect(height).toBeGreaterThanOrEqual(36); // Desktop input size
        }
      });
    });
  }
}); 