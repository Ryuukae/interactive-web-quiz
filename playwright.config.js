import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60000,
  fullyParallel: true,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    navigationTimeout: 30000,
    actionTimeout: 10000,
    baseURL: "http://localhost:5173",
    trace: "on-first-retry"
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 200, // Tolerance for anti-aliasing and sub-pixel differences
      threshold: 0.2, // Allow up to 20% pixel color threshold variance
      maxDiffPixelRatio: 0.05 // Allow up to 5% overall pixel ratio variance across OS environments
    }
  },

  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: !process.env.CI
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] }
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] }
    }
  ]
});
