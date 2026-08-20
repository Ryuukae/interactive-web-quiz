import { test, expect } from "@playwright/test";

/**
 * Helper to transition screens cleanly and update aria-hidden attributes,
 * matching AppNavigationController.navigateTo behavior.
 * @param {import('@playwright/test').Page} page - The Playwright page object to manipulate the DOM.
 * @param {'start' | 'creator' | 'quiz' | 'result'} targetScreen - The target screen to navigate to, must be one of the defined screen keys.
 */
async function navigateToScreen(page, targetScreen) {
  await page.evaluate((target) => {
    const screenMap = {
      start: "start-screen",
      creator: "creator-screen",
      quiz: "quiz-screen",
      result: "result-screen"
    };
    const targetId = screenMap[target];
    for (const id of Object.values(screenMap)) {
      const el = document.getElementById(id);
      if (!el) continue;
      const isActive = id === targetId;
      el.classList.toggle("active", isActive);
      el.setAttribute("aria-hidden", isActive ? "false" : "true");
    }
  }, targetScreen);
}

/**
 * Helper to set up the Results Screen state exactly as QuizUIController.showResults() does,
 * including isBuilderSource button toggles and dynamic percentage strings.
 * @param {import('@playwright/test').Page} page - The Playwright page object to manipulate the DOM.
 * @param {{ score?: number, maxScore?: number, isBuilderSource?: boolean }} options - An object containing optional parameters to configure the results screen state.
 */
async function setupResultScreenState(
  page,
  { score = 10, maxScore = 10, isBuilderSource = false } = {}
) {
  await page.evaluate(
    ({ score, maxScore, isBuilderSource }) => {
      const screenMap = {
        start: "start-screen",
        creator: "creator-screen",
        quiz: "quiz-screen",
        result: "result-screen"
      };
      for (const id of Object.values(screenMap)) {
        const el = document.getElementById(id);
        if (el) {
          const isActive = id === "result-screen";
          el.classList.toggle("active", isActive);
          el.setAttribute("aria-hidden", isActive ? "false" : "true");
        }
      }

      const finalScoreSpan = document.getElementById("final-score");
      const maxScoreSpan = document.getElementById("max-score");
      const resultMessage = document.getElementById("result-message");

      if (finalScoreSpan) finalScoreSpan.textContent = String(score);
      if (maxScoreSpan) maxScoreSpan.textContent = String(maxScore);
      if (resultMessage) {
        const percentage =
          maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        resultMessage.textContent = `${percentage}%`;
      }

      const returnStartBtn = document.getElementById("return-start-btn");
      const returnBuilderBtn = document.getElementById("return-builder-btn");

      if (isBuilderSource) {
        if (returnStartBtn) returnStartBtn.style.display = "none";
        if (returnBuilderBtn) returnBuilderBtn.style.display = "inline-flex";
      } else {
        if (returnStartBtn) returnStartBtn.style.display = "inline-flex";
        if (returnBuilderBtn) returnBuilderBtn.style.display = "none";
      }
    },
    { score, maxScore, isBuilderSource }
  );
}

/**
 * Helper to set up the Quiz Screen state matching QuizUIController.showQuestion(),
 * including isBuilderSource action stack toggling.
 * @param {import('@playwright/test').Page} page - The Playwright page object to manipulate the DOM.
 * @param {{ isBuilderSource?: boolean, question?: string, currentQuestion?: number, totalQuestions?: number, score?: number, answers?: Array<{ text: string, correct: boolean }> }} options - An object containing optional parameters to configure the quiz screen state.
 */
async function setupQuizScreenState(
  page,
  {
    isBuilderSource = false,
    question = "What is the default port for HTTPS?",
    currentQuestion = 1,
    totalQuestions = 3,
    score = 0,
    answers = [
      { text: "443", correct: true },
      { text: "80", correct: false },
      { text: "21", correct: false },
      { text: "8080", correct: false }
    ]
  } = {}
) {
  await page.evaluate(
    ({
      isBuilderSource,
      question,
      currentQuestion,
      totalQuestions,
      score,
      answers
    }) => {
      const screenMap = {
        start: "start-screen",
        creator: "creator-screen",
        quiz: "quiz-screen",
        result: "result-screen"
      };
      for (const id of Object.values(screenMap)) {
        const el = document.getElementById(id);
        if (el) {
          const isActive = id === "quiz-screen";
          el.classList.toggle("active", isActive);
          el.setAttribute("aria-hidden", isActive ? "false" : "true");
        }
      }

      const qText = document.getElementById("question-text");
      const currQ = document.getElementById("current-question");
      const totQ = document.getElementById("totalQuestionsSpan");
      const scoreEl = document.getElementById("score");
      const progressEl = document.getElementById("progress");

      if (qText) qText.textContent = question;
      if (currQ) currQ.textContent = String(currentQuestion);
      if (totQ) totQ.textContent = String(totalQuestions);
      if (scoreEl) scoreEl.textContent = String(score);
      if (progressEl) {
        const pct =
          totalQuestions > 0 ? (currentQuestion / totalQuestions) * 100 : 0;
        progressEl.style.width = `${pct}%`;
      }

      const answersContainer = document.getElementById("answers-container");
      if (answersContainer) {
        answersContainer.innerHTML = "";
        answers.forEach((a) => {
          const btn = document.createElement("button");
          btn.textContent = a.text;
          btn.classList.add("answer-btn");
          btn.dataset.correct = String(a.correct);
          answersContainer.appendChild(btn);
        });
      }

      const quizActionStack = document.getElementById("quiz-action-stack");
      if (quizActionStack) {
        quizActionStack.style.display = isBuilderSource ? "flex" : "none";
      }
    },
    {
      isBuilderSource,
      question,
      currentQuestion,
      totalQuestions,
      score,
      answers
    }
  );
}

test.describe("UI Visual Regression Audits", () => {
  // ==================================================
  // GLOBAL SETUP: Engineer a deterministic environment
  // ==================================================
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

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
            `
    });
  });

  // ==========================================
  // STAGE 1: START SCREEN (INITIAL STATE)
  // ==========================================
  test("Start Screen Baseline", async ({ page }) => {
    const startContainer = page.locator("#start-screen");
    await expect(startContainer).toBeVisible();
    await expect(startContainer).toHaveClass(/active/);
    await expect(startContainer.locator(".start-btn-take")).toBeVisible();
    await expect(startContainer.locator("#create-quizset-btn")).toBeVisible();

    await expect(startContainer).toHaveScreenshot("start-screen.png");
  });

  // ==========================================
  // STAGE 2: CREATOR SCREEN (BUILDER STATE)
  // ==========================================
  test("Creator Screen - Form Layout Integrity", async ({ page }) => {
    await page.click("#create-quizset-btn");
    await page.click("#btn-use-builder");

    const creatorForm = page.locator("#creator-screen");
    await expect(creatorForm).toBeVisible();
    await expect(creatorForm).toHaveClass(/active/);

    // Ensure initial builder card is rendered
    await expect(
      creatorForm.locator("#builder-questions-container .question-card")
    ).toHaveCount(1);

    await expect(creatorForm).toHaveScreenshot("creator-screen.png");
  });

  // ==========================================
  // STAGE 2B: EDITOR SCREEN (TEXT MODE)
  // ==========================================
  test("Editor Screen - Form Layout Integrity", async ({ page }) => {
    await page.click("#create-quizset-btn");
    await page.click("#btn-use-editor");

    const editorScreen = page.locator("#editor-screen");
    await expect(editorScreen).toBeVisible();
    await expect(editorScreen).toHaveClass(/active/);
    await expect(editorScreen.locator("#editor-textarea")).toBeVisible();
    await expect(editorScreen.locator("#btn-editor-parse")).toBeVisible();
    await expect(
      editorScreen.locator("#btn-editor-template-json")
    ).toBeVisible();
    await expect(
      editorScreen.locator("#btn-editor-template-txt")
    ).toBeVisible();

    await expect(editorScreen).toHaveScreenshot("editor-screen.png");
  });

  // =====================================================
  // STAGE 3: FORMAT GUIDE MODALS (EDITOR SCREEN)
  // =====================================================
  test("Editor Screen - TXT Format Guide Modal Opened", async ({ page }) => {
    // Navigate to editor screen
    await page.click("#create-quizset-btn");
    await page.click("#btn-use-editor");
    await expect(page.locator("#editor-screen")).toHaveClass(/active/);

    // Open TXT format guide modal
    await page.click("#btn-open-txt-guide");
    const guideModal = page.locator("#modal-guide-txt");
    await expect(guideModal).toHaveClass(/active/);
    await expect(guideModal.locator(".guide-grid-body")).toBeVisible();

    await expect(guideModal).toHaveScreenshot("format-guide-txt.png");
  });

  // ==============================================================
  // STAGE 4: QUIZ SCREEN (STANDARD VS BUILDER SESSIONS)
  // ==============================================================
  test("Quiz Screen - Standard Session Rendering", async ({ page }) => {
    await setupQuizScreenState(page, { isBuilderSource: false });

    const quizScreen = page.locator("#quiz-screen");
    await expect(quizScreen).toBeVisible();
    await expect(quizScreen).toHaveClass(/active/);
    await expect(quizScreen.locator("#quiz-action-stack")).toBeHidden();

    await expect(quizScreen).toHaveScreenshot("quiz-screen-standard.png");
  });

  test("Quiz Screen - Builder Session Rendering (isBuilderSource)", async ({
    page
  }) => {
    await setupQuizScreenState(page, { isBuilderSource: true });

    const quizScreen = page.locator("#quiz-screen");
    await expect(quizScreen).toBeVisible();
    await expect(quizScreen).toHaveClass(/active/);
    await expect(quizScreen.locator("#quiz-action-stack")).toBeVisible();
    await expect(quizScreen.locator("#quiz-return-builder-btn")).toBeVisible();

    await expect(quizScreen).toHaveScreenshot("quiz-screen-builder.png");
  });

  // ==============================================================
  // STAGE 5: RESULTS SCREEN (STANDARD VS BUILDER SESSIONS)
  // ==============================================================
  test("Results Screen - Perfect Score Rendering (Standard Source)", async ({
    page
  }) => {
    await setupResultScreenState(page, {
      score: 10,
      maxScore: 10,
      isBuilderSource: false
    });

    const resultsScreen = page.locator("#result-screen");
    await expect(resultsScreen).toBeVisible();
    await expect(resultsScreen).toHaveClass(/active/);
    await expect(resultsScreen.locator("#final-score")).toHaveText("10");
    await expect(resultsScreen.locator("#max-score")).toHaveText("10");
    await expect(resultsScreen.locator("#result-message")).toHaveText("100%");

    // Standard flow: Return to start button visible, builder hidden
    await expect(resultsScreen.locator("#return-start-btn")).toBeVisible();
    await expect(resultsScreen.locator("#return-builder-btn")).toBeHidden();

    await expect(resultsScreen).toHaveScreenshot("result-screen-perfect.png");
  });

  test("Results Screen - Builder Source Rendering (isBuilderSource)", async ({
    page
  }) => {
    await setupResultScreenState(page, {
      score: 10,
      maxScore: 10,
      isBuilderSource: true
    });

    const resultsScreen = page.locator("#result-screen");
    await expect(resultsScreen).toBeVisible();
    await expect(resultsScreen).toHaveClass(/active/);
    await expect(resultsScreen.locator("#final-score")).toHaveText("10");
    await expect(resultsScreen.locator("#max-score")).toHaveText("10");
    await expect(resultsScreen.locator("#result-message")).toHaveText("100%");

    // Builder flow: Return to builder visible, start hidden
    await expect(resultsScreen.locator("#return-start-btn")).toBeHidden();
    await expect(resultsScreen.locator("#return-builder-btn")).toBeVisible();

    await expect(resultsScreen).toHaveScreenshot("result-screen-builder.png");
  });
});
