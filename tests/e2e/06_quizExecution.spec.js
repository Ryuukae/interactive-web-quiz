import { test, expect } from "@playwright/test";

test.describe("E2E Spec 6: Complete Interactive Quiz Execution Flow", () => {
  test("should allow playing a quiz to completion and advancing through questions", async ({
    page
  }) => {
    await page.goto("http://localhost:5173");

    // Wait for app to be ready
    await page.waitForLoadState("networkidle");

    // Automatically accept any browser confirmation dialogs
    page.on("dialog", (dialog) => dialog.accept());

    // Navigate to Creator Screen
    await page.click("#create-quizset-btn");

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

    // Click "Start Quiz" button (#btn-run-builder-quiz)
    await page.click("#btn-run-builder-quiz");

    // Verify #quiz-screen is active
    const quizScreen = page.locator("#quiz-screen");
    await expect(quizScreen).toHaveClass(/active/);

    // Answer questions dynamically until the result screen appears
    const resultScreen = page.locator("#result-screen");

    while (
      !(await resultScreen.evaluate((node) =>
        node.classList.contains("active")
      ))
    ) {
      // Wait for answer buttons to be available and enabled
      const correctAnswerButton = page.locator(
        '#answers-container .answer-btn[data-correct="true"]'
      );
      await correctAnswerButton.waitFor({ state: "visible" });

      // Only click if the button is not disabled
      const isDisabled = await correctAnswerButton.evaluate(
        (node) => node.disabled
      );
      if (!isDisabled) {
        await correctAnswerButton.click();
      }

      // Wait a short tick before checking again
      await page.waitForTimeout(2000);
    }

    // Verify screen navigated to #result-screen upon completion
    await expect(resultScreen).toHaveClass(/active/);
  });
});
