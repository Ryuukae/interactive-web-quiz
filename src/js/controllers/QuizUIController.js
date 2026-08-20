import QuizState from "../models/QuizState.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("QuizUIController");

/**
 * UI controller coordinating active quiz sessions.
 * Manages dynamic rendering of questions, progress tracking, and interactive answer evaluation.
 *
 * @class QuizUIController
 * @name QuizUIController
 * @version 1.6.1
 * @author Adam Ross DeStafeno
 * @property {QuestionType[] | null} customPayload - Active question dataset loaded into memory.
 * @property {boolean} isBuilderSource - Flag indicating if the quiz was launched from the builder.
 * @property {QuizStateType} quizState - State model instance managing the quiz logic.
 * @property {AppNavigationControllerType} appNavController - Controller for screen routing.
 * @property {HTMLElement} questionText - DOM element displaying the current question text.
 * @property {HTMLElement} answersContainer - DOM container for multiple-choice buttons.
 * @property {HTMLElement} currentQuestionSpan - DOM element showing the current question index.
 * @property {HTMLElement} totalQuestionsSpan - DOM element showing total question count.
 * @property {HTMLElement} scoreSpan - DOM element displaying the live score.
 * @property {HTMLElement} finalScoreSpan - DOM element displaying the final test score.
 * @property {HTMLElement} maxScoreSpan - DOM element displaying the maximum possible score.
 * @property {HTMLElement} resultMessage - DOM element displaying the final grade percentage.
 * @property {HTMLElement} progressBar - DOM element representing visual progress.
 * @typedef {import('../types.js').QuizStateType} QuizStateType
 * @typedef {import('../types.js').AppNavigationControllerType} AppNavigationControllerType
 * @typedef {import('../types.js').QuestionType} QuestionType
 * @typedef {import('../types.js').AnswerType} AnswerType
 */
export default class QuizUIController {
  /**
   * Initializes the quiz UI controller and caches DOM nodes.
   * @name constructor
   * @public
   * @param {QuizStateType} quizState - The core Model housing the assessment logic.
   * @param {AppNavigationControllerType} appNavController - The centralized router utility.
   * @throws {Error} - If critical DOM elements are missing.
   */
  constructor(quizState, appNavController) {
    logger.info("constructor called");
    logger.debug("Initializing QuizUIController dependencies", {
      hasQuizState: Boolean(quizState),
      hasAppNav: Boolean(appNavController)
    });

    this.quizState = quizState;
    this.appNavController = appNavController;

    this.customPayload = null;
    this.isBuilderSource = false;

    this.questionText = this.getEl("question-text");
    this.answersContainer = this.getEl("answers-container");
    this.currentQuestionSpan = this.getEl("current-question");
    this.totalQuestionsSpan = this.getEl("totalQuestionsSpan");
    this.scoreSpan = this.getEl("score");
    this.finalScoreSpan = this.getEl("final-score");
    this.maxScoreSpan = this.getEl("max-score");
    this.resultMessage = this.getEl("result-message");
    this.progressBar = this.getEl("progress");

    logger.info("Quiz UI controller initialized");
    logger.debug("Quiz UI controller ready for session start");

    this.bindEventListeners();
  }

  /**
   * Safely retrieves a DOM element by ID.
   * @param {string} id - The DOM element ID.
   * @returns {HTMLElement} - The resolved DOM element.
   * @throws {Error} - If the DOM node is missing.
   */
  getEl(id) {
    logger.debug("getEl called", { id });
    const el = document.getElementById(id);
    if (!(el instanceof HTMLElement))
      throw new Error(`Missing DOM node: ${id}`);
    return el;
  }

  /**
   * Delegates click tracking and window events for the quiz interface.
   * @name bindEventListeners
   * @public
   * @returns {void}
   */
  bindEventListeners() {
    logger.info("bindEventListeners called");
    logger.debug("Binding restart and window resize event listeners");

    const restartBtn = document.getElementById("restart-btn");
    if (restartBtn instanceof HTMLButtonElement) {
      restartBtn.addEventListener("click", () => {
        logger.info("bindEventListeners: onRestartButtonClick event");
        logger.debug("Restarting active quiz session from button trigger");
        this.startQuiz();
      });
    }

    if (typeof window !== "undefined") {
      window.addEventListener("resize", () => {
        const quizScreen = document.getElementById("quiz-screen");
        if (quizScreen && quizScreen.classList.contains("active")) {
          logger.debug(
            "Window resize detected while quiz active, recalculating font size"
          );
          this.adjustQuestionTextFontSize();
        }
      });
    }
  }

  /**
   * Loads a custom question payload into the quiz controller and starts the session.
   * @name loadCustomQuiz
   * @public
   * @param {QuestionType[]} payload - Assessment question objects.
   * @param {boolean} [isBuilderSource] - Context flag for builder navigation return.
   * @returns {void}
   */
  loadCustomQuiz(payload, isBuilderSource = false) {
    logger.info("loadCustomQuiz called", {
      payload,
      questionCount: payload ? payload.length : 0,
      isBuilderSource
    });
    logger.debug("Staging custom quiz payload", {
      questionCount: payload ? payload.length : 0
    });
    this.customPayload = payload;
    this.isBuilderSource = isBuilderSource;
    this.startQuiz();
  }

  /**
   * Synchronizes question count and max score bounds on the UI.
   * @name synchronizeBounds
   * @public
   * @returns {void}
   */
  synchronizeBounds() {
    logger.info("synchronizeBounds called");
    const totalCount = this.quizState.questionData.length;
    this.totalQuestionsSpan.textContent = String(totalCount);
    this.maxScoreSpan.textContent = String(totalCount);
    logger.debug("Quiz bounds synchronized", { totalCount });
  }

  /**
   * Evaluates state and starts the active quiz session.
   * @name startQuiz
   * @public
   * @returns {void}
   */
  startQuiz() {
    logger.info("startQuiz called", {
      hasCustomPayload: Boolean(this.customPayload)
    });
    if (this.customPayload) {
      logger.info("Instantiating QuizState with custom payload");
      logger.debug("Creating new QuizState instance from customPayload", {
        questionCount: this.customPayload.length
      });
      this.quizState = new QuizState(this.customPayload);
      this.synchronizeBounds();
    }

    this.quizState.resetQuiz();
    this.scoreSpan.textContent = String(this.quizState.score);

    const quizActionStack = document.getElementById("quiz-action-stack");
    if (quizActionStack) {
      quizActionStack.style.display = this.isBuilderSource ? "flex" : "none";
    }

    this.appNavController.navigateTo("quiz");
    this.showQuestion();
    logger.info("Quiz session started", {
      questionCount: this.quizState.questionData.length
    });
    logger.debug("Quiz interface rendered and active");
  }

  /**
   * Renders the active question and answer options to the DOM.
   * @name showQuestion
   * @public
   * @returns {void}
   */
  showQuestion() {
    logger.info("showQuestion called");
    this.quizState.resetClickLock();

    const currentQuestion = this.quizState.getCurrentQuestion();
    if (!currentQuestion) {
      logger.warn(
        "No current question available while rendering quiz question"
      );
      return;
    }

    this.currentQuestionSpan.textContent = String(this.quizState.index + 1);
    this.progressBar.style.width = `${this.quizState.getProgressPercentage()}%`;
    this.questionText.textContent = currentQuestion.question;
    this.adjustQuestionTextFontSize();
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => {
        this.adjustQuestionTextFontSize();
      });
    }

    this.answersContainer.innerHTML = "";

    currentQuestion.answers.forEach((answer) => {
      logger.trace("showQuestion: renderAnswerButtonCallback", {
        text: answer.text,
        correct: answer.correct
      });
      const button = document.createElement("button");
      button.textContent = answer.text;
      button.classList.add("answer-btn");

      button.dataset.correct = String(answer.correct);
      button.addEventListener("click", (event) => {
        logger.info("showQuestion: onAnswerClick event", {
          event
        });
        logger.debug("User clicked answer button", { text: answer.text });
        this.selectAnswer(event);
      });

      this.answersContainer.appendChild(button);
    });

    logger.debug("Question rendered", {
      index: this.quizState.index,
      answerCount: currentQuestion.answers.length
    });
  }

  /**
   * Dynamically adjusts question text font size to be as large as possible without overflowing its container.
   * @returns {void}
   */
  adjustQuestionTextFontSize() {
    if (!(this.questionText instanceof HTMLElement)) return;

    const el = this.questionText;

    // Determine the maximum vertical capacity of the question container
    const computed =
      typeof window !== "undefined" && window.getComputedStyle
        ? window.getComputedStyle(el)
        : null;
    const parsedMax = computed ? parseFloat(computed.maxHeight) : NaN;
    const winHeight = typeof window !== "undefined" ? window.innerHeight : 800;
    const maxAllowedHeight = Math.max(
      !isNaN(parsedMax) && parsedMax > 0 ? parsedMax : 0,
      winHeight * 0.48,
      260
    );

    const minSize = 1.0; // rem
    const maxSize = 2.2; // rem (caps short questions from appearing disproportionately large)

    let low = minSize;
    let high = maxSize;
    let bestSize = minSize;

    // 10-iteration binary search for sub-0.01rem precision sizing
    for (let i = 0; i < 10; i++) {
      const mid = (low + high) / 2;
      el.style.fontSize = `${mid.toFixed(2)}rem`;

      // Check if text content fits cleanly within maximum allowable vertical space
      if (el.scrollHeight <= maxAllowedHeight + 2) {
        bestSize = mid;
        low = mid; // Fit succeeded, explore larger size
      } else {
        high = mid; // Exceeded height bounds, explore smaller size
      }
    }

    el.style.fontSize = `${bestSize.toFixed(2)}rem`;
    logger.debug("Question font size adjusted", {
      calculatedSizeRem: bestSize.toFixed(2)
    });
  }

  /**
   * Processes selected answer
   * @name selectAnswer
   * @public
   * @param {Event} event - Native click event
   * @returns {void} - Does not return a value.
   */
  selectAnswer(event) {
    logger.info("selectAnswer called", { event });
    if (this.quizState.disabled) {
      logger.warn("Answer selection ignored because quiz state is locked");
      return;
    }

    const selectedButton = event.target;
    if (!(selectedButton instanceof HTMLElement)) return;
    const isCorrect = selectedButton.dataset.correct === "true";
    logger.info("Answer selected", { isCorrect });
    logger.debug("Applying visual answer highlights to all choices");

    Array.from(this.answersContainer.children).forEach((button) => {
      if (!(button instanceof HTMLElement)) return;
      logger.trace("selectAnswer: highlightButtonCallback", {
        buttonText: button.textContent,
        isCorrect: button.dataset.correct === "true"
      });
      button.classList.add(
        button.dataset.correct === "true" ? "correct" : "incorrect"
      );
    });

    this.quizState.evaluateAnswer(isCorrect);
    this.scoreSpan.textContent = String(this.quizState.score);

    setTimeout(() => {
      logger.info("selectAnswer: advanceTimeoutCallback executed");
      logger.debug("Advancing to next question or results view");
      this.quizState.advanceQuestion();

      if (this.quizState.isQuizOver()) {
        this.showResults();
      } else {
        this.showQuestion();
      }
    }, 3000);
  }

  /**
   * Navigates to the results screen and displays final score metrics.
   * @name showResults
   * @public
   * @returns {void}
   */
  showResults() {
    logger.info("showResults called");
    this.appNavController.navigateTo("result");

    this.finalScoreSpan.textContent = String(this.quizState.score);
    const percentage = this.quizState.getGradePercentage();
    this.resultMessage.textContent = percentage + "%";

    const returnStartBtn = this.getEl("return-start-btn");
    const returnBuilderBtn = this.getEl("return-builder-btn");

    if (this.isBuilderSource) {
      returnStartBtn.style.display = "none";
      returnBuilderBtn.style.display = "inline-flex";
    } else {
      returnStartBtn.style.display = "inline-flex";
      returnBuilderBtn.style.display = "none";
    }

    logger.info("Quiz results displayed", {
      score: this.quizState.score,
      totalQuestions: this.quizState.questionData.length,
      percentage,
      isBuilderSource: this.isBuilderSource
    });
    logger.debug("Results screen metrics committed to DOM");
  }
}
