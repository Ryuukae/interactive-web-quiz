import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60000,
  fullyParallel: true,
  reporter: 'list',
  use: {
    navigationTimeout: 30000,
    actionTimeout: 10000,
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100, // Tolerance for anti-aliasing differences
    },
  },

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});