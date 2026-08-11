import { test, expect } from '@playwright/test';

test.describe('E2E Spec 6: Complete Interactive Quiz Execution Flow', () => {

    test('should allow playing a quiz to completion and advancing through questions', async ({ page }) => {
        await page.goto('http://localhost:5173');

        // Navigate to Creator Screen
        await page.click('#create-quizset-btn');

        // Expand Bulk Import Panel if collapsed
        await page.click('#bulk-import-header');

        // Insert sample QAD question deck
        const quizDeck = 'Q=What is 1+1?\nA=2\nD=3\n\nQ=What color is the sky?\nA=Blue\nD=Green';
        await page.fill('#bulk-import-text', quizDeck);

        // Parse Quizset Data
        await page.click('#btn-parse-bulk');

        // Click "Start Quiz" button (#btn-run-builder-quiz)
        await page.click('#btn-run-builder-quiz');

        // Verify #quiz-screen is active
        const quizScreen = page.locator('#quiz-screen');
        await expect(quizScreen).toHaveClass(/active/);

        // Click an answer option button
        const firstAnswerButton = page.locator('#answers-container .answer-btn').first();
        await firstAnswerButton.click();

        // Click answer option button for second question
        const secondAnswerButton = page.locator('#answers-container .answer-btn').first();
        await secondAnswerButton.click();

        // Verify screen navigated to #result-screen upon completion
        const resultScreen = page.locator('#result-screen');
        await expect(resultScreen).toHaveClass(/active/);
    });
});
