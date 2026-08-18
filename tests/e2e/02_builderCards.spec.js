import { test, expect } from "@playwright/test";

test.describe("E2E Spec 2: Dynamic Question Card Builder Operations", () => {
  test("should allow adding, populating, and removing dynamic question cards", async ({
    page
  }) => {
    await page.goto("http://localhost:5173");

    // Wait for app to be ready
    await page.waitForLoadState("networkidle");

    // Navigate to Creator Screen
    await page.click("#create-quizset-btn");

    // Click "+ Add Question" button
    await page.click("#btn-add-question");

    // Verify a card was added to #builder-questions-container
    const cards = page.locator("#builder-questions-container .question-card");
    await expect(cards).toHaveCount(1);

    // Fill question text field
    const questionInput = cards.first().locator(".question-input");
    await questionInput.fill("What is the chemical symbol for Gold?");

    // Fill correct answer field
    const correctInput = cards
      .first()
      .locator('.answer-row.correct-row input[type="text"]');
    await correctInput.fill("Au");

    // Fill distractor answer field
    const distractorInput = cards
      .first()
      .locator('.answer-row.distractor-row input[type="text"]')
      .first();
    await distractorInput.fill("Ag");

    // Remove the card
    page.once("dialog", (dialog) => dialog.accept());
    await cards.first().locator(".remove-card-btn").click();
    await expect(cards).toHaveCount(0);
  });
});
