import { devices, chromium, firefox, webkit } from '@playwright/test';

export const deviceProfiles = {
  desktop: {
    viewport: { width: 1280, height: 720 },
    userAgent: 'Desktop Chrome',
    hasTouch: false,
  },
  tablet: {
    ...devices['iPad Pro 11'],
  },
  mobile: {
    ...devices['Pixel 5'],
  },
};

export async function testOnDevice(deviceName: keyof typeof deviceProfiles, testFn: Function) {
  const browsers = [
    { name: 'Chrome', launcher: chromium },
    { name: 'Firefox', launcher: firefox },
    { name: 'Safari', launcher: webkit },
  ];

  for (const browser of browsers) {
    const context = await browser.launcher.launch();
    const page = await context.newPage();
    await page.setViewportSize(deviceProfiles[deviceName].viewport);
    
    try {
      await testFn(page);
    } finally {
      await context.close();
    }
  }
} 