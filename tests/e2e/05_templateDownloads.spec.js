import { test, expect } from "@playwright/test";

test.describe("E2E Spec 5: Template Ingestion & File Download Triggers", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:5173");
    await page.waitForLoadState("networkidle");
    // Open creation mode modal → choose Text Editor
    await page.click("#create-quizset-btn");
    await page.click("#btn-use-editor");
    await expect(page.locator("#editor-screen")).toHaveClass(/active/);
  });

  test("should populate JSON template into textarea when JSON template button is clicked", async ({
    page
  }) => {
    const textarea = page.locator("#editor-textarea");
    await page.click("#btn-editor-template-json");
    // Should contain JSON-like structure (array bracket or 'question' key)
    await expect(textarea).toHaveValue(/question/);
  });

  test("should populate TXT template into textarea when TXT template button is clicked", async ({
    page
  }) => {
    const textarea = page.locator("#editor-textarea");
    // Accept the overwrite confirmation dialog if it appears
    page.on("dialog", (dialog) => dialog.accept());
    await page.click("#btn-editor-template-txt");
    // Should contain QAD tag format
    await expect(textarea).toHaveValue(/Q=/i);
  });

  test("should open and close the fullscreen editor modal via expand button", async ({
    page
  }) => {
    const modal = page.locator("#modal-focus-editor");
    await expect(modal).not.toHaveClass(/active/);

    // Open modal
    await page.click("#btn-focus-editor-expand");
    await expect(modal).toHaveClass(/active/);
    await expect(page.locator("#focus-editor-textarea")).toBeVisible();

    // Close via X button
    await page.click("#close-focus-editor-btn");
    await expect(modal).not.toHaveClass(/active/);
  });

  test("should sync fullscreen modal content back to main textarea on Apply & Save", async ({
    page
  }) => {
    const mainTextarea = page.locator("#editor-textarea");
    const modal = page.locator("#modal-focus-editor");
    const focusTextarea = page.locator("#focus-editor-textarea");

    // Open fullscreen modal
    await page.click("#btn-focus-editor-expand");
    await expect(modal).toHaveClass(/active/);

    // Type into fullscreen textarea
    await focusTextarea.click();
    await focusTextarea.fill('Q="Fullscreen Test?"\nA="Yes"\nD="No"');

    // Apply & Save
    await page.click("#btn-focus-editor-done");
    await expect(modal).not.toHaveClass(/active/);

    // Main textarea should now have the same content
    await expect(mainTextarea).toHaveValue(/Fullscreen Test/);
  });

  test("should open the TXT format guide modal and then close it", async ({
    page
  }) => {
    await page.click("#btn-open-txt-guide");
    const guideModal = page.locator("#modal-guide-txt");
    await expect(guideModal).toHaveClass(/active/);

    await page.click("#close-guide-txt-btn");
    await expect(guideModal).not.toHaveClass(/active/);
  });

  test("should open the JSON format guide modal and then close it", async ({
    page
  }) => {
    await page.click("#btn-open-json-guide");
    const guideModal = page.locator("#modal-guide-json");
    await expect(guideModal).toHaveClass(/active/);

    await page.click("#close-guide-json-btn");
    await expect(guideModal).not.toHaveClass(/active/);
  });
});
