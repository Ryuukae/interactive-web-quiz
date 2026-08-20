import { confirmAction, alertAction } from "../utils/prompts.js";
import { exportQAD } from "../utils/fileIO.js";
import BuilderCardComponent from "../components/BuilderCardComponent.js";
import QuestionFocusModalComponent from "../components/QuestionFocusModalComponent.js";
import StorageService from "../utils/StorageService.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("BuilderUIController");

/**
 * UI controller coordinating the form builder interface.
 * Maps UI actions (add, bulk parse, clear) to component updates and model mutations.
 *
 * @class BuilderUIController
 * @name BuilderUIController
 * @version 1.6.2
 * @author Adam Ross DeStafeno
 * @property {BuilderStateType} builderState - The central tracker modeling card components.
 * @property {QuizUIControllerType} quizUIController - Controller for launching quiz previews.
 * @property {AppNavigationControllerType} appNavController - Controller for screen transitions.
 * @property {HTMLElement} builderContainer - DOM container housing the question cards.
 * @property {QuestionFocusModalComponent} focusModal - Workstation controller for single cards.
 * @property {number | ReturnType<typeof setTimeout> | null} saveTimeout - Timeout reference for debounce logic.
 * @typedef {import('../types.js').BuilderStateType} BuilderStateType
 * @typedef {import('../types.js').QuizUIControllerType} QuizUIControllerType
 * @typedef {import('../types.js').AppNavigationControllerType} AppNavigationControllerType
 * @typedef {import('../types.js').QuestionType} QuestionType
 * @typedef {import('../types.js').RawQuestionType} RawQuestionType
 * @typedef {import('../types.js').BuilderCardPrefillType} BuilderCardPrefillType
 */
export default class BuilderUIController {
  /**
   * Initializes the form builder UI controller with DOM bindings and state models.
   * @name constructor
   * @public
   * @param {BuilderStateType} builderState - The central tracker modeling card components.
   * @param {QuizUIControllerType} quizUIController - Controller for launching quiz previews.
   * @param {AppNavigationControllerType} appNavController - Controller for screen transitions.
   */
  constructor(builderState, quizUIController, appNavController) {
    logger.info("constructor called");
    logger.debug("Initializing BuilderUIController dependencies", {
      hasBuilderState: Boolean(builderState),
      hasQuizUI: Boolean(quizUIController),
      hasAppNav: Boolean(appNavController)
    });

    this.builderState = builderState;
    this.quizUIController = quizUIController;
    this.appNavController = appNavController;

    this.saveTimeout = null;

    const container = document.getElementById("builder-questions-container");
    if (!(container instanceof HTMLElement)) {
      throw new Error(`Missing DOM node: builder-questions-container`);
    }
    this.builderContainer = container;

    // Instantiate focus modal
    this.focusModal = new QuestionFocusModalComponent(appNavController);

    logger.info("Builder UI controller initialized");
    logger.debug("Builder UI controller ready for user actions");
    this.initializeEventListeners();
    this.initializeBuilder();
  }

  /**
   * Hooks event listeners to form builder operations.
   * @name initializeEventListeners
   * @public
   * @returns {void}
   */
  initializeEventListeners() {
    logger.info("initializeEventListeners called");
    logger.debug("Binding Form Builder UI button and input listeners");

    const addBtn = document.getElementById("btn-add-question");
    if (addBtn) {
      addBtn.addEventListener("click", () => {
        logger.debug("Add question button clicked");
        this.handleAddQuestion();
      });
    }

    const runBtn = document.getElementById("btn-run-builder-quiz");
    if (runBtn) {
      runBtn.addEventListener("click", () => {
        logger.debug("Run builder quiz button clicked");
        this.startBuilderQuiz();
      });
    }

    const exportBtn = document.getElementById("btn-export-quiz");
    if (exportBtn) {
      exportBtn.addEventListener("click", () => {
        logger.debug("Export builder quiz button clicked");
        this.exportBuilderQuiz();
      });
    }

    const clearBtn = document.getElementById("btn-clear-builder");
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        logger.info("Clear builder requested");
        logger.debug("Checking card count before clear", {
          cardCount: this.builderState.cards.length
        });
        if (this.builderState.cards.length === 0) return;
        if (
          confirmAction(
            "Are you sure you want to clear all questions? This action cannot be undone."
          )
        ) {
          logger.debug("User confirmed clearing all builder cards");
          StorageService.clear("quiz-builder-cache");
          this.builderState.clearAll();
          this.initializeBuilder();
        }
      });
    }

    // 10-second highly performant debounce auto-save
    this.builderContainer.addEventListener("input", () => {
      if (this.saveTimeout !== null) {
        clearTimeout(this.saveTimeout);
      }
      this.saveTimeout = setTimeout(() => {
        logger.info("Auto-saving builder state after 10s debounce");
        const payload = this.builderState.getSerializedPayload();
        logger.debug("Persisting builder state payload", {
          questionCount: payload.length
        });
        StorageService.save("quiz-builder-cache", payload);
      }, 10000);
    });
  }

  /**
   * Callback executed when the focus modal saves data.
   * @param {RawQuestionType} questionData - The committed question data.
   * @param {import('../components/BuilderCardComponent.js').default | null} activeFocusCard - The card being edited, or null if new.
   */
  handleModalSave(questionData, activeFocusCard) {
    logger.info("handleModalSave called", {
      isEdit: Boolean(activeFocusCard),
      questionText: questionData?.question
    });
    logger.debug("Processing modal save data", {
      isEdit: Boolean(activeFocusCard),
      questionData
    });
    if (activeFocusCard) {
      const card = activeFocusCard;
      if (card.qInput) {
        card.qInput.value = questionData.question;
        const titleNode = card.node.querySelector(".card-title");
        if (titleNode)
          titleNode.textContent = questionData.question || "New Question...";
        if (typeof card.autoExpand === "function") card.autoExpand(card.qInput);
      }

      if (card.aInput) {
        card.aInput.value = questionData.correct_answer || "";
        if (typeof card.autoExpand === "function") card.autoExpand(card.aInput);
      }

      if (card.dContainer && questionData.distractors) {
        const targetDContainer = card.dContainer;
        targetDContainer.innerHTML = "";
        questionData.distractors.forEach((mdText) => {
          const text = typeof mdText === "string" ? mdText : mdText.text;
          const input = document.createElement("textarea");
          input.className = "glass-input d-input";
          input.placeholder = "e.g., 80";
          input.value = text;
          input.addEventListener("input", () => {
            if (typeof card.autoExpand === "function") card.autoExpand(input);
          });
          targetDContainer.appendChild(input);
          if (typeof card.autoExpand === "function") card.autoExpand(input);
        });

        if (typeof card.updateDistractorButtonStates === "function") {
          card.updateDistractorButtonStates();
        } else if (card.addBtn) {
          card.addBtn.style.display =
            targetDContainer.children.length >= 6 ? "none" : "inline-flex";
        }
      }
      logger.debug("Existing card updated from focus modal");
    } else {
      // New Question Mode: construct and append a new card with entered values
      logger.debug("Constructing and appending new card from focus modal");
      this.builderState.collapseAllCards();

      const newCard = new BuilderCardComponent(
        questionData,
        (card) => {
          this.builderState.removeCard(card);
          StorageService.save(
            "quiz-builder-cache",
            this.builderState.getSerializedPayload()
          );
        },
        () => {},
        (card) => {
          this.focusModal.open(card, this.handleModalSave.bind(this));
        }
      );

      this.builderState.addCard(newCard);
      this.builderContainer.appendChild(newCard.node);

      setTimeout(() => {
        logger.debug("Scrolling builder container to new card");
        this.builderContainer.scrollTo({
          top: this.builderContainer.scrollHeight,
          behavior: "smooth"
        });
      }, 50);
    }
  }

  /**
   * Locates the first validation error within the builder container and scrolls it smoothly into the viewport.
   * @name scrollToFirstError
   * @public
   * @returns {void}
   */
  scrollToFirstError() {
    logger.info("scrollToFirstError called");
    logger.debug("Locating first validation error node");
    setTimeout(() => {
      const firstError = this.builderContainer.querySelector(".input-error");
      if (firstError) {
        logger.debug("First error found, scrolling into view", { firstError });
        const errorCard = firstError.closest(".question-card") || firstError;
        errorCard.scrollIntoView({ behavior: "smooth", block: "start" });
        if (firstError instanceof HTMLElement) {
          firstError.focus({ preventScroll: true });
        }
      }
    }, 50);
  }

  /**
   * Resets and initializes the builder from cache or a default empty question card.
   * @name initializeBuilder
   * @public
   * @returns {void}
   */
  initializeBuilder() {
    logger.info("initializeBuilder called");
    logger.debug("Clearing existing builder state and DOM");
    this.builderState.clearAll();
    this.builderContainer.innerHTML = "";

    const cachedData = /** @type {QuestionType[] | null} */ (
      StorageService.load("quiz-builder-cache")
    );

    if (cachedData && cachedData.length > 0) {
      logger.info("Hydrating builder cards from cache", {
        cardCount: cachedData.length
      });
      logger.debug("Creating builder cards from cached questions");
      cachedData.forEach((q) => {
        const newCard = new BuilderCardComponent(
          q,
          (card) => {
            this.builderState.removeCard(card);
            StorageService.save(
              "quiz-builder-cache",
              this.builderState.getSerializedPayload()
            );
          },
          () => {},
          (card) => {
            this.focusModal.open(card, this.handleModalSave.bind(this));
          }
        );
        this.builderState.addCard(newCard);
        this.builderContainer.appendChild(newCard.node);
      });
    } else {
      logger.info(
        "No cache detected, initializing single default question card"
      );
      logger.debug("Constructing default blank builder card");
      const newCard = new BuilderCardComponent(
        null,
        (card) => {
          this.builderState.removeCard(card);
          StorageService.save(
            "quiz-builder-cache",
            this.builderState.getSerializedPayload()
          );
        },
        () => {},
        (card) => {
          this.focusModal.open(card, this.handleModalSave.bind(this));
        }
      );
      this.builderState.addCard(newCard);
      this.builderContainer.appendChild(newCard.node);
    }
  }

  /**
   * Checks whether the builder currently contains user-authored or non-empty question data.
   * @returns {boolean} True if any card has non-empty question, answer, or distractor fields.
   */
  hasExistingData() {
    logger.info("hasExistingData called");
    logger.debug("Checking card field contents in builderState", {
      cardCount: this.builderState?.cards?.length || 0
    });
    if (!this.builderState || !this.builderState.cards) return false;
    if (this.builderState.cards.length > 1) return true;
    if (this.builderState.cards.length === 1) {
      const card = this.builderState.cards[0];
      const qVal = card.qInput?.value?.trim() || "";
      const aVal = card.aInput?.value?.trim() || "";
      const hasDistractors = card.dContainer
        ? Array.from(card.dContainer.querySelectorAll(".d-input")).some(
            (d) => d instanceof HTMLTextAreaElement && d.value.trim() !== ""
          )
        : false;
      const hasData = qVal !== "" || aVal !== "" || hasDistractors;
      logger.debug("Evaluated single card data existence", {
        hasData,
        qVal,
        aVal,
        hasDistractors
      });
      return hasData;
    }
    return false;
  }

  /**
   * Populates the builder card list from an external dataset (e.g. from Modify Quiz).
   * @param {Array<any>} questionDataArray - Question objects to populate.
   * @returns {void}
   */
  populateCardsFromData(questionDataArray) {
    logger.info("populateCardsFromData called", {
      itemCount: Array.isArray(questionDataArray) ? questionDataArray.length : 0
    });
    logger.debug("Resetting builder and populating new cards from array");
    if (!Array.isArray(questionDataArray) || questionDataArray.length === 0) {
      return;
    }

    this.builderState.clearAll();
    this.builderContainer.innerHTML = "";

    questionDataArray.forEach((q) => {
      const newCard = new BuilderCardComponent(
        q,
        (card) => {
          this.builderState.removeCard(card);
        },
        () => {},
        (card) => {
          this.focusModal.open(card, this.handleModalSave.bind(this));
        }
      );
      this.builderState.addCard(newCard);
      this.builderContainer.appendChild(newCard.node);
    });

    const payload = this.builderState.getSerializedPayload();
    logger.debug("Saving populated cards to cache", {
      questionCount: payload.length
    });
    StorageService.save("quiz-builder-cache", payload);
  }

  /**
   * Validates cards and triggers the focus modal to add a new question.
   * @name handleAddQuestion
   * @public
   * @returns {void}
   */
  handleAddQuestion() {
    logger.info("handleAddQuestion called");
    logger.debug("Validating limits and card states before adding question");
    if (this.builderState.cards.length >= 50) {
      logger.warn("Add question rejected: Limit of 50 reached");
      alertAction("Maximum question limit reached (50).");
      return;
    }

    if (!this.builderState.validateAllCards()) {
      logger.warn("Add question blocked: Existing card validation failed");
      this.scrollToFirstError();
      return;
    }

    logger.debug("Opening focus modal for new question entry");
    this.focusModal.open(null, this.handleModalSave.bind(this));
  }

  /**
   * Validates builder cards and launches the quiz preview session.
   * @name startBuilderQuiz
   * @public
   * @returns {void}
   */
  startBuilderQuiz() {
    logger.info("startBuilderQuiz called");
    logger.debug("Validating builder cards for quiz start", {
      cardCount: this.builderState.cards.length
    });
    if (this.builderState.cards.length === 0) {
      logger.warn("Start quiz rejected: No builder cards present");
      alertAction("Please add at least one question before starting the quiz.");
      return;
    }

    if (!this.builderState.validateAllCards()) {
      logger.warn("Start quiz blocked: Card validation failed");
      this.scrollToFirstError();
      return;
    }

    const payload = this.builderState.getSerializedPayload();
    if (payload.length === 0) {
      logger.warn("Start quiz blocked: Serialized payload is empty");
      alertAction("Please complete at least one question before starting.");
      return;
    }

    logger.info("Launching builder preview quiz", {
      questionCount: payload.length
    });
    logger.debug("Loading custom quiz payload with builder source flag");
    this.quizUIController.loadCustomQuiz(payload, true);
  }

  /**
   * Validates builder cards and exports the dataset as a QAD file.
   * @name exportBuilderQuiz
   * @public
   * @returns {void}
   */
  exportBuilderQuiz() {
    logger.info("exportBuilderQuiz called");
    logger.debug("Validating builder cards for export");
    if (this.builderState.cards.length === 0) {
      logger.warn("Export rejected: No builder cards present");
      alertAction("Please add at least one question before exporting.");
      return;
    }

    if (!this.builderState.validateAllCards()) {
      logger.warn("Export blocked: Card validation failed");
      this.scrollToFirstError();
      return;
    }

    const payload = this.builderState.getSerializedPayload();
    logger.info("Exporting builder quiz dataset", {
      questionCount: payload.length
    });
    logger.debug("Triggering exportQAD file download");
    exportQAD(payload, "custom_quizset.txt");
    StorageService.clear("quiz-builder-cache");
  }
}
