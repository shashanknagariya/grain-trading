import { test, expect } from '@playwright/test';
import { performanceTesting } from '../src/utils/performanceTesting';

test.describe('Performance Tests', () => {
  test('Homepage load performance', async ({ page }) => {
    const results = await performanceTesting.runTest({
      name: 'homepage',
      duration: 5000,
      samples: 3,
      threshold: {
        fcp: 1000,
        lcp: 2500,
        fid: 100,
        cls: 0.1,
        ttfb: 600
      }
    });

    // Verify performance metrics
    expect(results.average.fcp).toBeLessThan(1000);
    expect(results.average.lcp).toBeLessThan(2500);
    expect(results.average.fid).toBeLessThan(100);
    expect(results.average.cls).toBeLessThan(0.1);
    expect(results.average.ttfb).toBeLessThan(600);
  });

  test('Navigation performance', async ({ page }) => {
    await page.goto('/');
    
    const navigationStart = Date.now();
    await page.click('a[href="/dashboard"]');
    await page.waitForLoadState('networkidle');
    const navigationEnd = Date.now();

    const navigationTime = navigationEnd - navigationStart;
    expect(navigationTime).toBeLessThan(1000);
  });

  test('Form interaction performance', async ({ page }) => {
    await page.goto('/purchases/new');

    const interactionStart = Date.now();
    await page.fill('input[name="quantity"]', '100');
    await page.fill('input[name="price"]', '50');
    await page.click('button[type="submit"]');
    const interactionEnd = Date.now();

    const interactionTime = interactionEnd - interactionStart;
    expect(interactionTime).toBeLessThan(500);
  });
}); 