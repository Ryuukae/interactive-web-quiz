import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility Audits", () => {
  test("should not have any automatically detectable accessibility issues on load", async ({
    page
  }) => {
    await page.goto("http://localhost:5173");

    // Wait for app to be ready
    await page.waitForLoadState("networkidle");

    // Wait for the main UI to render
    await page.waitForSelector("#start-screen.active");

    const accessibilityScanResults = await new AxeBuilder({
      page
    }).analyze();

    // Expect exactly 0 violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should maintain accessibility in Quiz view", async ({ page }) => {
    await page.goto("http://localhost:5173");

    // Wait for app to be ready
    await page.waitForLoadState("networkidle");
    // Automatically accept any browser confirmation dialogs
    page.on("dialog", (dialog) => dialog.accept());

    // Go to builder
    await page.click("#create-quizset-btn");
    await page.waitForSelector("#creator-screen.active");

    // First question is already there, just fill it
    const cards = page.locator("#builder-questions-container .question-card");
    await cards.nth(0).locator(".question-input").fill("What is 1+1?");
    await cards.nth(0).locator(".answer-row.correct-row textarea").fill("2");
    await cards
      .nth(0)
      .locator(".answer-row.distractor-row textarea")
      .first()
      .fill("3");

    // Add second question
    await page.click("#btn-add-question");
    await cards
      .nth(1)
      .locator(".question-input")
      .fill("What color is the sky?");
    await cards.nth(1).locator(".answer-row.correct-row textarea").fill("Blue");
    await cards
      .nth(1)
      .locator(".answer-row.distractor-row textarea")
      .first()
      .fill("Green");

    // Start Quiz
    await page.locator("#btn-run-builder-quiz").click();

    // Wait for quiz view to appear
    await page.waitForSelector("#quiz-screen.active");

    const accessibilityScanResults = await new AxeBuilder({
      page
    }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
