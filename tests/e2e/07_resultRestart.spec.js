import { test, expect } from "@playwright/test";

test.describe("E2E Spec 7: Result Summary & Restart Flow", () => {
  test("should display result metrics and allow returning to start screen", async ({
    page
  }) => {
    await page.goto("http://localhost:5173");

    // Wait for app to be ready
    await page.waitForLoadState("networkidle");

    // Navigate to Creator Screen
    await page.click("#create-quizset-btn");
    await page.click("#btn-use-builder");

    // Expand Bulk Import Panel if collapsed
    await page.click("#bulk-import-header");

    // Insert sample QAD question
    page.on("dialog", (dialog) => dialog.accept());
    await page.click("#btn-clear-builder");
    await page.fill(
      "#bulk-import-text",
      "Q=Is HTML a programming language?\nA=No\nD=Yes"
    );
    await page.click("#btn-parse-bulk");

    // Start Quiz
    await page.click("#btn-run-builder-quiz");

    // Answer question
    await page.locator("#answers-container .answer-btn").first().click();

    // Verify #result-screen is active
    const resultScreen = page.locator("#result-screen");
    await expect(resultScreen).toHaveClass(/active/);

    // Click "Back to Builder" button (#return-builder-btn)
    await page.click("#return-builder-btn");

    // Verify #creator-screen is active
    const creatorScreen = page.locator("#creator-screen");
    await expect(creatorScreen).toHaveClass(/active/);
  });
});
