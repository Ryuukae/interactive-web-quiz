import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Audits', () => {
    test('should not have any automatically detectable accessibility issues on load', async ({ page }) => {
        await page.goto('http://localhost:5173');
        
        // Wait for the main UI to render
        await page.waitForSelector('#start-screen.active');
        
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        
        // Expect exactly 0 violations
        expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should maintain accessibility in Quiz view', async ({ page }) => {
        await page.goto('http://localhost:5173');
        // Automatically accept any browser confirmation dialogs
        page.on('dialog', dialog => dialog.accept());

        // Go to builder
        await page.click('#create-quizset-btn');
        await page.waitForSelector('#creator-screen.active');

        // Expand Bulk Import Panel if collapsed
        await page.click('#bulk-import-header');

        // Insert sample QAD question deck
        const quizDeck = 'Q=What is 1+1?\nA=2\nD=3\n\nQ=What color is the sky?\nA=Blue\nD=Green';
        await page.fill('#bulk-import-text', quizDeck);

        // Clear any default cards before parsing
        await page.click('#btn-clear-builder');

        // Parse Quizset Data
        await page.click('#btn-parse-bulk');
        
        // Start Quiz
        await page.locator('#btn-run-builder-quiz').click();
        
        // Wait for quiz view to appear
        await page.waitForSelector('#quiz-screen.active');
        
        const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
        
        expect(accessibilityScanResults.violations).toEqual([]);
    });
});
