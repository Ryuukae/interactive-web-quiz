import { test, expect } from '@playwright/test';

test.describe('UI Visual Regression Audits', () => {

    // =====================================================================
    // 1. GLOBAL SETUP: Engineer a deterministic environment
    // =====================================================================
    test.beforeEach(async ({ page }) => {
        await page.goto('/');

        // Wait for fonts to load. Prevents text from rendering in a fallback 
        // font (like Times New Roman) which instantly fails the image diff.
        await page.evaluate(() => document.fonts.ready);

        // Forcefully kill all CSS animations and transitions globally.
        // This ensures things like dropdowns and accordions snap open instantly,
        // so Playwright doesn't accidentally photograph a mid-animation frame.
        await page.addStyleTag({
            content: `
                *, *::before, *::after {
                    animation-duration: 0s !important;
                    transition-duration: 0s !important;
                }
            `,
        });
    });

    // =====================================================================
    // 2. STATIC SCREENS: Baseline the primary views
    // =====================================================================
    test('Start Screen Baseline', async ({ page }) => {
        const startContainer = page.locator('#start-screen');
        await expect(startContainer).toBeVisible();
        await expect(startContainer).toHaveScreenshot('start-screen.png');
    });

    test('Creator Screen - Form Layout Integrity', async ({ page }) => {
        await page.click('#create-quizset-btn');

        const creatorForm = page.locator('#creator-screen');
        await expect(creatorForm).toBeVisible();

        // Photographing this entire container acts as a layout safeguard.
        // If a CSS update accidentally pushes inputs onto different rows, 
        // this snapshot will immediately catch the broken flexbox/grid layout.
        await expect(creatorForm).toHaveScreenshot('creator-screen.png');
    });

    // =====================================================================
    // 3. INTERACTIVE COMPONENTS: Test isolated states
    // =====================================================================
    test('Accordion Component - Format Guide Expanded', async ({ page }) => {
        // Navigate to the view where the accordion lives
        await page.click('#create-quizset-btn');

        // Expand the bulk import panel first
        await page.click('#bulk-import-header');

        const formatGuideAccordion = page.locator('details.format-guide').first();
        await expect(formatGuideAccordion).toBeVisible();

        // Trigger the state change
        await formatGuideAccordion.locator('summary').click();

        // Assert the internal content is visible before taking the picture.
        // Because we killed animations in `beforeEach`, we don't need arbitrary timeouts.
        await expect(formatGuideAccordion.locator('.guide-content')).toBeVisible();

        await expect(formatGuideAccordion).toHaveScreenshot('format-guide-expanded.png');
    });

    // =====================================================================
    // 4. DYNAMIC STATES: State injection (No clicking through manually)
    // =====================================================================
    test('Results Screen - Perfect Score Rendering', async ({ page }) => {
        // Professional suites don't waste CI minutes clicking through 10 questions.
        // They inject the exact required state directly into the browser.

        await page.evaluate(() => {
            document.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
            document.getElementById('result-screen').classList.add('active');
            document.getElementById('final-score').textContent = '10';
            document.getElementById('max-score').textContent = '10';
            document.getElementById('result-message').textContent = 'Perfect!';
        });

        const resultsScreen = page.locator('#result-screen');
        await expect(resultsScreen).toBeVisible();

        await expect(resultsScreen).toHaveScreenshot('result-screen-perfect.png');
    });
});