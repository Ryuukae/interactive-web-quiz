import { test, expect } from "@playwright/test";

test.describe("E2E Spec 5: Template Ingestion & File Download Triggers", () => {
  test("should populate template text into textarea when template buttons are clicked", async ({
    page
  }) => {
    await page.goto("http://localhost:5173");

    // Wait for app to be ready
    await page.waitForLoadState("networkidle");

    // Navigate to Creator Screen
    await page.click("#create-quizset-btn");

    // Expand Bulk Import Panel if collapsed
    await page.click("#bulk-import-header");

    // Click "Insert JSON Template" button (#btn-template-json)
    await page.click("#btn-template-json");

    // Verify textarea contains JSON structure
    const textarea = page.locator("#bulk-import-text");
    await expect(textarea).toHaveValue(/question/);

    // Click "Insert TXT Template" button (#btn-template-txt)
    page.on("dialog", (dialog) => dialog.accept());
    await page.click("#btn-template-txt");
    await expect(textarea).toHaveValue(/Q=/i);
  });
});
