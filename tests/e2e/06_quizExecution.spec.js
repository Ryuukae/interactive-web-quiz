import { test, expect } from '@playwright/test';

test.describe('E2E Spec 6: Complete Interactive Quiz Execution Flow', () => {

    test('should allow playing a quiz to completion and advancing through questions', async ({ page }) => {
        await page.goto('http://localhost:5173');

        // Automatically accept any browser confirmation dialogs
        page.on('dialog', dialog => dialog.accept());

        // Navigate to Creator Screen
        await page.click('#create-quizset-btn');

        // Expand Bulk Import Panel if collapsed
        await page.click('#bulk-import-header');

        // Insert sample QAD question deck
        const quizDeck = 'Q=What is 1+1?\nA=2\nD=3\n\nQ=What color is the sky?\nA=Blue\nD=Green';
        await page.fill('#bulk-import-text', quizDeck);

        // Clear any default cards before parsing
        await page.click('#btn-clear-builder');

        // Parse Quizset Data
        await page.click('#btn-parse-bulk');

        // Click "Start Quiz" button (#btn-run-builder-quiz)
        await page.click('#btn-run-builder-quiz');

        // Verify #quiz-screen is active
        const quizScreen = page.locator('#quiz-screen');
        await expect(quizScreen).toHaveClass(/active/);

        // Answer questions dynamically until the result screen appears
        const resultScreen = page.locator('#result-screen');
        
        while (!(await resultScreen.evaluate(node => node.classList.contains('active')))) {
            // Wait for answer buttons to be available and enabled
            const correctAnswerButton = page.locator('#answers-container .answer-btn[data-correct="true"]');
            await correctAnswerButton.waitFor({ state: 'visible' });
            
            // Only click if the button is not disabled
            const isDisabled = await correctAnswerButton.evaluate(node => node.disabled);
            if (!isDisabled) {
                await correctAnswerButton.click();
            }
            
            // Wait a short tick before checking again
            await page.waitForTimeout(500);
        }

        // Verify screen navigated to #result-screen upon completion
        await expect(resultScreen).toHaveClass(/active/);
    });
});
