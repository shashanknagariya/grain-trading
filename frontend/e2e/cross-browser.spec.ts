import { test, expect } from '@playwright/test';

test.describe('Cross-browser compatibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('responsive layout works across browsers', async ({ page }) => {
    // Test desktop layout
    await page.setViewportSize({ width: 1280, height: 800 });
    const sidebar = await page.locator('[role="complementary"]');
    await expect(sidebar).toBeVisible();

    // Test mobile layout
    await page.setViewportSize({ width: 375, height: 667 });
    const bottomNav = await page.locator('[role="navigation"]');
    await expect(bottomNav).toBeVisible();
  });

  test('text overflow handling works across browsers', async ({ page }) => {
    await page.goto('/inventory');
    const cardTitle = await page.locator('.MuiCardHeader-title').first();
    
    // Check if ellipsis is applied when text overflows
    const isEllipsisApplied = await cardTitle.evaluate((el) => {
      return window.getComputedStyle(el).textOverflow === 'ellipsis';
    });
    expect(isEllipsisApplied).toBeTruthy();
  });

  test('RTL support works across browsers', async ({ page }) => {
    // Change language to Arabic or another RTL language
    await page.click('[aria-label="change language"]');
    await page.click('text=हिंदी');

    // Check if RTL layout is applied correctly
    const isRTL = await page.evaluate(() => {
      return document.dir === 'rtl';
    });
    expect(isRTL).toBeTruthy();
  });
}); 