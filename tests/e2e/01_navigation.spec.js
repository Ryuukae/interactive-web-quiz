import { test, expect } from "@playwright/test";

test.describe("E2E Spec 1: Screen Navigation & State Transitions", () => {
  test("should transition cleanly between start, creator, and quiz screens", async ({
    page
  }) => {
    await page.goto("http://localhost:5173");

    // Wait for app to be ready
    await page.waitForLoadState("networkidle");

    // Verify initial screen is #start-screen
    const startScreen = page.locator("#start-screen");
    await expect(startScreen).toHaveClass(/active/);

    // Click "Create Quizset" button
    await page.click("#create-quizset-btn");
    await page.click("#btn-use-builder");

    // Verify screen navigated to #creator-screen
    const creatorScreen = page.locator("#creator-screen");
    await expect(creatorScreen).toHaveClass(/active/);

    // Click "Back to Start" button
    await page.click("#btn-cancel-create");
    await expect(startScreen).toHaveClass(/active/);

    // Click "Create Quizset" button and then "Use Editor"
    await page.click("#create-quizset-btn");
    await page.click("#btn-use-editor");

    // Verify screen navigated to #editor-screen
    const editorScreen = page.locator("#editor-screen");
    await expect(editorScreen).toHaveClass(/active/);

    // Click "Cancel" on editor screen
    await page.click("#btn-editor-cancel");
    await expect(startScreen).toHaveClass(/active/);
  });
});
