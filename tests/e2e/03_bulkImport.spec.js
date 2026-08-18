import { test, expect } from "@playwright/test";

test.describe("E2E Spec 3: Bulk Text Import Operations (QAD & JSON)", () => {
  test("should parse QAD text input and auto-generate question cards", async ({
    page
  }) => {
    await page.goto("http://localhost:5173");

    // Wait for app to be ready
    await page.waitForLoadState("networkidle");

    // Navigate to Creator Screen
    await page.click("#create-quizset-btn");

    // Expand Bulk Import Panel if collapsed
    await page.click("#bulk-import-header");

    // Paste QAD formatted text into textarea
    const sampleQAD =
      "Q=What is the speed of light?\nA=299,792,458 m/s\nD=300,000 km/s\nD=150,000 km/s";
    await page.fill("#bulk-import-text", sampleQAD);

    // Click "Parse Quizset Data" button
    await page.click("#btn-parse-bulk");

    // Verify generated question card exists
    const cards = page.locator("#builder-questions-container .question-card");
    await expect(cards).toHaveCount(1);
  });
});
