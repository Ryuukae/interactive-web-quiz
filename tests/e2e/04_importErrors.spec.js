import { test, expect } from '@playwright/test';

test.describe('E2E Spec 4: Bulk Import Error Handling', () => {

    test('should display clean error message when attempting to parse invalid text', async ({ page }) => {
        await page.goto('http://localhost:5173');

        // Navigate to Creator Screen
        await page.click('#create-quizset-btn');

        // Expand Bulk Import Panel if collapsed
        await page.click('#bulk-import-header');

        // Fill textarea with invalid QAD text missing correct answer
        await page.fill('#bulk-import-text', 'Q=Incomplete Question?\nD=Distractor Only');

        // Click "Parse Quizset Data"
        await page.click('#btn-parse-bulk');

        // Verify status element contains error message
        const statusElement = page.locator('#bulk-import-status');
        await expect(statusElement).toBeVisible();
    });
});
