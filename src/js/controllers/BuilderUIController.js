import { confirmAction, alertAction } from "../utils/prompts.js";
import { exportQAD } from "../utils/fileIO.js";
import BuilderCardComponent from "../components/BuilderCardComponent.js";
import StorageService from "../utils/StorageService.js";
import { createLogger } from "../utils/logger.js";

/**
 * UI controller coordinating the form builder interface.
 * Maps UI actions (add, bulk parse, clear) to component updates and model mutations.
 *
 * @class BuilderUIController
 * @name BuilderUIController
 * @version 1.5.2
 * @author Adam Ross DeStafeno
 * @property {BuilderStateType} builderState - The central tracker modeling card components.
 * @property {QuizUIControllerType} quizUIController - Controller for launching quiz previews.
 * @property {AppNavigationControllerType} appNavController - Controller for screen transitions.
 * @property {HTMLElement} builderContainer - DOM container housing the question cards.
 * @property {HTMLElement} bulkImportPanel - DOM container for the bulk import UI.
 * @property {HTMLTextAreaElement} bulkImportText - DOM input for bulk question payloads.
 * @property {HTMLElement} bulkImportStatus - DOM element for displaying bulk import errors.
 * @property {number | ReturnType<typeof setTimeout> | null} saveTimeout - Timeout reference for debounce logic.
 * @typedef {import('../types.js').BuilderStateType} BuilderStateType
 * @typedef {import('../types.js').QuizUIControllerType} QuizUIControllerType
 * @typedef {import('../types.js').AppNavigationControllerType} AppNavigationControllerType
 * @typedef {import('../types.js').QuestionType} QuestionType
 */
export default class BuilderUIController {
  /**
   * Links physical nodes with Model authorities cleanly.
   * @name constructor
   * @public
   * @param {BuilderStateType} builderState - The central tracker modeling card components natively.
   * @param {QuizUIControllerType} quizUIController - Exposed for direct bypass assessment triggers explicitly.
   * @param {AppNavigationControllerType} appNavController - Coordinates manual routing assignments optimally.
   * @throws {Error} If the bulk-import-text element is not found or not a textarea.
   */
  constructor(builderState, quizUIController, appNavController) {
    this.logger = createLogger("BuilderUIController");
    this.logger.info("constructor called", {
      builderState,
      quizUIController,
      appNavController
    });

    this.builderState = builderState;
    this.quizUIController = quizUIController;
    this.appNavController = appNavController;

    // Inline casting for the null timeout
    this.saveTimeout =
      /** @type {number | ReturnType<typeof setTimeout> | null} */ (null);

    this.builderContainer = this.getEl("builder-questions-container");

    this.logger.info("Builder UI controller initialized");

    this.initializeEventListeners();
  }

  /**
   * Safely retrieves a DOM element by ID.
   * @param {string} id - The DOM element ID.
   * @returns {HTMLElement} - The resolved DOM node.
   * @throws {Error} - If the DOM node is not found.
   */
  getEl(id) {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLElement))
      throw new Error(`Missing DOM node: ${id}`);
    return el;
  }

  /**
   * Hooks physical actions explicitly to bounded component workflows and logical routines securely.
   * @name initializeEventListeners
   * @public
   * @returns {void} - Does not return a value.
   */
  initializeEventListeners() {
    this.logger.info("initializeEventListeners called");
    this.getEl("create-quizset-btn").addEventListener("click", () => {
      this.logger.info("initializeEventListeners: onCreateQuizsetClick event");
      this.logger.info("Create quiz set requested from builder UI");
      this.initializeBuilder();
    });

    this.getEl("btn-add-question").addEventListener("click", () => {
      this.logger.info("initializeEventListeners: onAddQuestionClick event");
      this.logger.info("Add question requested");
      this.handleAddQuestion();
    });

    this.getEl("btn-run-builder-quiz").addEventListener("click", () => {
      this.logger.info("initializeEventListeners: onRunBuilderQuizClick event");
      this.logger.info("Run builder quiz requested");
      this.startBuilderQuiz();
    });

    this.getEl("btn-export-quiz").addEventListener("click", () => {
      this.logger.info("initializeEventListeners: onExportQuizClick event");
      this.logger.info("Export builder quiz requested");
      this.exportBuilderQuiz();
    });

    this.getEl("btn-clear-builder").addEventListener("click", () => {
      this.logger.info("initializeEventListeners: onClearBuilderClick event");
      this.logger.info("Clear builder requested", {
        cardCount: this.builderState.cards.length
      });
      if (this.builderState.cards.length === 0) return;
      if (
        confirmAction(
          "Are you sure you want to clear all questions? This action cannot be undone."
        )
      ) {
        StorageService.clear("quiz-builder-cache");
        this.builderState.clearAll();
        this.initializeBuilder(); // Reinitialize with an empty card
      }
    });

    // 10-second highly performant debounce auto-save
    this.builderContainer.addEventListener("input", () => {
      if (this.saveTimeout !== null) {
        clearTimeout(this.saveTimeout);
      }
      this.saveTimeout = setTimeout(() => {
        this.logger.info("Auto-saving builder state after 10s debounce");
        const payload = this.builderState.getSerializedPayload();
        StorageService.save("quiz-builder-cache", payload);
      }, 10000);
    });
  }

  /**
   * Safely forces the bulk import panel into a constrained CSS visibility state.
   * @name collapseBulkImport
   * @public
   * @returns {void} - Does not return a value.
   */

  /**
   * Locates the first validation error within the builder container and scrolls it smoothly into the viewport.
   * @name scrollToFirstError
   * @public
   * @returns {void} - Does not return a value.
   */
  scrollToFirstError() {
    this.logger.info("scrollToFirstError called");
    this.logger.debug("Scrolling to first builder validation error");
    /* Defers execution briefly to ensure DOM paint mapping is completed prior to scroll interception natively. */
    // ----------------------------------------------------------------------
    setTimeout(() => {
      this.logger.info("scrollToFirstError: scrollTimeoutCallback executed");
      const firstError = this.builderContainer.querySelector(".input-error");
      if (firstError) {
        firstError.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
        this.logger.info("Scrolled to first builder validation error");
      }
    }, 50);
    // ----------------------------------------------------------------------
  }

  /**
   * Purges legacy artifacts completely, explicitly triggering primary baseline construction capabilities to guarantee a fresh logical execution state.
   * @name initializeBuilder
   * @public
   * @returns {void} - Does not return a value.
   */
  initializeBuilder() {
    this.logger.info("initializeBuilder called");
    this.logger.info("Initializing builder workspace");
    this.builderState.clearAll();
    this.builderContainer.innerHTML = "";

    const cachedData = /** @type {QuestionType[] | null} */ (
      StorageService.load("quiz-builder-cache")
    );

    if (cachedData && cachedData.length > 0) {
      this.logger.info("Restoring cached builder state", {
        count: cachedData.length
      });
      cachedData.forEach((q) => {
        const newCard = new BuilderCardComponent(
          q,
          (card) => {
            this.logger.info("initializeBuilder: removeCardCallback", { card });
            this.builderState.removeCard(card);
            StorageService.save(
              "quiz-builder-cache",
              this.builderState.getSerializedPayload()
            );
          },
          () => {
            this.logger.info("initializeBuilder: expandCallback");
          }
        );
        this.builderState.addCard(newCard);
        this.builderContainer.appendChild(newCard.node);
      });
    } else {
      const newCard = new BuilderCardComponent(
        null,
        (card) => {
          this.logger.info("initializeBuilder: removeCardCallback", {
            card
          });
          this.builderState.removeCard(card);
          StorageService.save(
            "quiz-builder-cache",
            this.builderState.getSerializedPayload()
          );
        },
        () => {
          this.logger.info("initializeBuilder: expandCallback");
        }
      );
      this.builderState.addCard(newCard);
      this.builderContainer.appendChild(newCard.node);
    }

    this.logger.info("Builder workspace initialized", {
      cardCount: this.builderState.cards.length
    });
  }

  /**
   * Safeguards validation protocols natively, collapsing active visual tracks, triggering strict node generation, and scrolling into bounded zones systematically.
   * @name handleAddQuestion
   * @public
   * @returns {void} - Does not return a value.
   */
  handleAddQuestion() {
    this.logger.info("handleAddQuestion called");
    this.logger.info("Handling add question request");
    /* Encapsulates the execution chain to strictly block execution mapping errors while preserving physical viewport alignment properties dynamically. */
    // ----------------------------------------------------------------------
    if (!this.builderState.validateAllCards()) {
      this.logger.warn("Add question blocked by validation failure");
      this.scrollToFirstError();
      return;
    }

    this.builderState.collapseAllCards();

    const newCard = new BuilderCardComponent(
      null,
      (card) => {
        this.logger.info("handleAddQuestion: removeCardCallback", {
          card
        });
        this.builderState.removeCard(card);
      },
      () => {
        this.logger.info("handleAddQuestion: expandCallback");
      }
    );
    this.builderState.addCard(newCard);
    this.builderContainer.appendChild(newCard.node);

    setTimeout(() => {
      this.logger.info("handleAddQuestion: scrollTimeoutCallback executed");
      this.builderContainer.scrollTo({
        top: this.builderContainer.scrollHeight,
        behavior: "smooth"
      });
      this.logger.info("Builder scrolled to newest question", {
        cardCount: this.builderState.cards.length
      });
    }, 50);
    // ----------------------------------------------------------------------
  }

  /**
   * Manages error interception cleanly and delegates custom payload parsing natively to the external testing controller bypass function natively.
   * @name startBuilderQuiz
   * @public
   * @returns {void} - Does not return a value.
   */
  startBuilderQuiz() {
    this.logger.info("startBuilderQuiz called");
    this.logger.info("Starting builder quiz preview");
    if (this.builderState.cards.length === 0) {
      this.logger.warn(
        "Builder quiz start blocked because there are no questions"
      );
      alertAction("Please add at least one question before starting the quiz.");
      return;
    }

    if (!this.builderState.validateAllCards()) {
      this.logger.warn("Builder quiz start blocked by validation failure");

      this.scrollToFirstError();
      return;
    }

    const payload = this.builderState.getSerializedPayload();

    if (payload.length === 0) {
      this.logger.warn(
        "Builder quiz start blocked because serialized payload is empty"
      );
      alertAction("Please complete at least one question before starting.");
      return;
    }

    this.logger.info("Builder quiz payload ready", {
      questionCount: payload.length
    });
    this.quizUIController.loadCustomQuiz(payload, true);
  }

  /**
   * Scrapes localized logical states explicitly against output algorithms seamlessly physically.
   * @name exportBuilderQuiz
   * @public
   * @returns {void} - Does not return a value.
   */
  exportBuilderQuiz() {
    this.logger.info("exportBuilderQuiz called");
    this.logger.info("Exporting builder quiz");
    if (this.builderState.cards.length === 0) {
      this.logger.warn("Builder export blocked because there are no questions");
      alertAction("Please add at least one question before exporting.");
      return;
    }

    if (!this.builderState.validateAllCards()) {
      this.logger.warn("Builder export blocked by validation failure");

      this.scrollToFirstError();
      return;
    }

    const payload = this.builderState.getSerializedPayload();
    exportQAD(payload, "custom_quizset.txt");
    StorageService.clear("quiz-builder-cache");
    this.logger.info("Builder quiz export completed and cache cleared", {
      questionCount: payload.length
    });
  }
}
