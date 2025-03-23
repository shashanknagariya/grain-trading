import { PlaywrightTestConfig, devices } from '@playwright/test';
import { DEVICE_CONFIGS } from './src/utils/deviceTestUtils';

const config: PlaywrightTestConfig = {
  testDir: './e2e',
  timeout: 30000,
  retries: 2,
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'webkit',
      use: { browserName: 'webkit' },
    },
    {
      name: 'iPhone 13',
      use: {
        ...devices['iPhone 13'],
        browserName: 'webkit',
      },
    },
    {
      name: 'iPad',
      use: {
        ...devices['iPad (gen 7)'],
        browserName: 'webkit',
      },
    },
    {
      name: 'Pixel 5',
      use: {
        ...devices['Pixel 5'],
        browserName: 'chromium',
      },
    },
  ],
};

export default config; 