import { test, expect } from "@playwright/test";

test.describe("E2E Spec 4: Bulk Import Formatting Exceptions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("networkidle");
    // Open creation mode modal → choose Text Editor
    await page.click("#create-quizset-btn");
    await page.click("#btn-use-editor");
    await expect(page.locator("#editor-screen")).toHaveClass(/active/);
  });

  test("should display clean error message when attempting to parse invalid QAD text", async ({
    page
  }) => {
    // Unquoted QAD is invalid in the current parser
    await page.fill(
      "#editor-textarea",
      "Q=Incomplete Question?\nD=Distractor Only"
    );

    // Click "Preview Quiz"
    await page.click("#btn-editor-parse");

    // Status element should display an error
    const statusElement = page.locator("#editor-status");
    await expect(statusElement).toBeVisible();
    await expect(statusElement).toHaveText(/error/i);

    // Should NOT transition to quiz screen
    await expect(page.locator("#editor-screen")).toHaveClass(/active/);
  });

  test("should display error when QAD group is missing correct answer", async ({
    page
  }) => {
    // Valid Q and D tags but missing A tag
    await page.fill(
      "#editor-textarea",
      'Q="Missing Answer Question?"\nD="Wrong option A"\nD="Wrong option B"'
    );

    await page.click("#btn-editor-parse");

    const statusElement = page.locator("#editor-status");
    await expect(statusElement).toBeVisible();
    await expect(statusElement).toHaveText(/error/i);
  });

  test("should display error when QAD group is missing distractors", async ({
    page
  }) => {
    // Valid Q and A tags but no D tag
    await page.fill(
      "#editor-textarea",
      'Q="Question with no distractors?"\nA="Correct Answer"'
    );

    await page.click("#btn-editor-parse");

    const statusElement = page.locator("#editor-status");
    await expect(statusElement).toBeVisible();
    await expect(statusElement).toHaveText(/error/i);
  });

  test("should display error for malformed JSON input", async ({ page }) => {
    await page.fill("#editor-textarea", '[ { "question": "Bad JSON", }');

    await page.click("#btn-editor-parse");

    const statusElement = page.locator("#editor-status");
    await expect(statusElement).toBeVisible();
    await expect(statusElement).toHaveText(/error/i);
  });
});
