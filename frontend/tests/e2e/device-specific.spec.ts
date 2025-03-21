import { test } from '@playwright/test';
import { deviceProfiles, testOnDevice } from '../utils/deviceTesting';

test.describe('Device Specific Features', () => {
  test('touch interactions', async () => {
    await testOnDevice('mobile', async (page) => {
      await page.goto('/');
      
      // Test pull-to-refresh
      await page.mouse.move(100, 100);
      await page.mouse.down();
      await page.mouse.move(100, 300);
      await page.mouse.up();
      
      // Verify refresh occurred
      // ... add assertions
    });
  });

  test('responsive layout', async () => {
    for (const [device, profile] of Object.entries(deviceProfiles)) {
      await testOnDevice(device as keyof typeof deviceProfiles, async (page) => {
        await page.goto('/');
        
        // Check layout-specific elements
        const menu = await page.locator('.menu-button');
        const isMenuVisible = await menu.isVisible();
        
        // Different assertions based on device
        if (device === 'mobile') {
          expect(isMenuVisible).toBeTruthy();
        } else {
          expect(isMenuVisible).toBeFalsy();
        }
      });
    }
  });
}); 