import { test, expect } from "@playwright/test";

test.describe("E2E Spec 3: Bulk Text Import Operations (QAD & JSON)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("networkidle");
    // Open creation mode modal → choose Text Editor
    await page.click("#create-quizset-btn");
    await page.click("#btn-use-editor");
    await expect(page.locator("#editor-screen")).toHaveClass(/active/);
  });

  test("should parse QAD text input and launch the quiz preview", async ({
    page
  }) => {
    const sampleQAD =
      'Q="What is the speed of light?"\nA="299,792,458 m/s"\nD="300,000 km/s"\nD="150,000 km/s"';
    await page.fill("#editor-textarea", sampleQAD);

    // Click "Preview Quiz" to parse
    await page.click("#btn-editor-parse");

    // Should transition to quiz screen
    await expect(page.locator("#quiz-screen")).toHaveClass(/active/);
    // Question text should reflect parsed question
    await expect(page.locator("#question-text")).toHaveText(
      "What is the speed of light?"
    );
  });

  test("should parse valid JSON input and launch the quiz preview", async ({
    page
  }) => {
    const sampleJSON = JSON.stringify([
      {
        question: "What is 2 + 2?",
        answers: [
          { text: "4", correct: true },
          { text: "3", correct: false },
          { text: "5", correct: false }
        ]
      }
    ]);
    await page.fill("#editor-textarea", sampleJSON);
    await page.click("#btn-editor-parse");

    await expect(page.locator("#quiz-screen")).toHaveClass(/active/);
    await expect(page.locator("#question-text")).toHaveText("What is 2 + 2?");
  });

  test("should show error status when parsing empty textarea", async ({
    page
  }) => {
    // Leave textarea empty and click parse
    await page.click("#btn-editor-parse");

    const status = page.locator("#editor-status");
    await expect(status).toBeVisible();
    await expect(status).toHaveText(/please provide data to parse/i);
  });
});
