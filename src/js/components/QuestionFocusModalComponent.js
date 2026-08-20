import { createLogger } from "../utils/logger.js";

const logger = createLogger("QuestionFocusModalComponent");

/**
 * Encapsulated workstation component for modifying a single question in an expanded focus modal.
 *
 * @class QuestionFocusModalComponent
 * @name QuestionFocusModalComponent
 * @version 1.6.0
 * @author Adam Ross DeStafeno
 * @property {AppNavigationControllerType} appNavController - Central router instance.
 * @property {BuilderCardComponentType | null} activeFocusCard - Currently active card component.
 * @property {((data: RawQuestionType, card: BuilderCardComponentType | null) => void) | null} onSaveCallback - Save handler callback.
 * @property {HTMLElement | null} modal - Focus modal dialog element.
 * @property {HTMLElement | null} qInput - Question textarea element.
 * @property {HTMLElement | null} aInput - Answer textarea element.
 * @property {HTMLElement | null} dContainer - Distractors container element.
 * @property {HTMLElement | null} addBtn - Add distractor button element.
 * @property {HTMLElement | null} removeBtn - Remove distractor button element.
 * @property {HTMLElement | null} modalTitle - Modal title element.
 * @property {HTMLElement | null} modalBadge - Modal badge element.
 * @property {string[]} dVals - Distractor values list.
 * @typedef {import('../types.js').BuilderCardComponentType} BuilderCardComponentType
 * @typedef {import('../types.js').AppNavigationControllerType} AppNavigationControllerType
 * @typedef {import('../types.js').RawQuestionType} RawQuestionType
 */
export default class QuestionFocusModalComponent {
  /**
   * Initializes the question focus modal DOM bindings and caches elements.
   * @param {AppNavigationControllerType} appNavController - The centralized routing controller.
   */
  constructor(appNavController) {
    logger.info("constructor called");
    logger.debug("Initializing QuestionFocusModalComponent DOM references");
    this.appNavController = appNavController;
    this.activeFocusCard = null;
    this.onSaveCallback = null;
    this.dVals = /** @type {string[]} */ ([]);

    // Cache elements exclusively
    this.modal = document.getElementById("modal-focus-edit");
    this.qInput = document.getElementById("focus-modal-q-input");
    this.aInput = document.getElementById("focus-modal-a-input");
    this.dContainer = document.getElementById(
      "focus-modal-distractors-container"
    );
    this.addBtn = document.getElementById("btn-focus-modal-add-distractor");
    this.removeBtn = document.getElementById(
      "btn-focus-modal-remove-distractor"
    );
    this.modalTitle = this.modal?.querySelector(".focus-modal-title") || null;
    this.modalBadge = this.modal?.querySelector(".focus-badge") || null;

    logger.debug("QuestionFocusModalComponent elements cached");
    this.bindEvents();
  }

  /**
   * Binds event listeners for modal controls, distractors, and form actions.
   * @returns {void}
   */
  bindEvents() {
    logger.info("bindEvents called");
    logger.debug("Binding focus modal control and distractor action listeners");
    const doneBtn = document.getElementById("btn-focus-modal-done");
    const cancelBtn = document.getElementById("btn-focus-modal-cancel");
    const closeBtn = document.getElementById("close-focus-edit-btn");

    if (this.addBtn) {
      this.addBtn.addEventListener("click", () => {
        logger.info("bindEvents: onAddDistractorClick event");
        if (this.dContainer && this.dContainer.children.length < 6) {
          const input = document.createElement("textarea");
          input.className = "glass-input d-input";
          input.placeholder = "e.g., 80";
          this.dContainer.appendChild(input);
          this.updateDistractorBtnStates();
          logger.debug("Added distractor input in focus modal", {
            newCount: this.dContainer.children.length
          });
        }
      });
    }

    if (this.removeBtn) {
      this.removeBtn.addEventListener("click", () => {
        logger.info("bindEvents: onRemoveDistractorClick event");
        if (this.dContainer && this.dContainer.children.length > 1) {
          this.dContainer.lastElementChild?.remove();
          this.updateDistractorBtnStates();
          logger.debug("Removed distractor input in focus modal", {
            remainingCount: this.dContainer.children.length
          });
        }
      });
    }

    if (this.modal) {
      this.modal.addEventListener("input", (e) => {
        if (e.target instanceof HTMLTextAreaElement) {
          this.clearModalFieldError(e.target);
        }
      });
    }

    const discardAndClose = () => {
      logger.info("Focus modal edits discarded");
      logger.debug("Closing focus modal without saving changes");
      this.clearAllModalErrors();
      this.appNavController.closeModalById("modal-focus-edit");
      this.activeFocusCard = null;
    };

    if (cancelBtn) cancelBtn.addEventListener("click", discardAndClose);
    if (closeBtn) closeBtn.addEventListener("click", discardAndClose);

    if (doneBtn) {
      doneBtn.addEventListener("click", () => {
        logger.info("bindEvents: onDoneClick event");
        if (!this.validateFocusModal()) {
          logger.warn("Focus modal save blocked by validation error");
          return;
        }

        logger.info("Focus modal edits committed successfully");
        logger.debug("Extracting modal form values to trigger onSaveCallback");

        if (this.onSaveCallback) {
          const qVal =
            this.qInput instanceof HTMLTextAreaElement
              ? this.qInput.value.trim()
              : "";
          const aVal =
            this.aInput instanceof HTMLTextAreaElement
              ? this.aInput.value.trim()
              : "";
          this.dVals = [];
          if (this.dContainer) {
            this.dContainer.querySelectorAll(".d-input").forEach((d) => {
              if (d instanceof HTMLTextAreaElement && d.value.trim()) {
                this.dVals.push(d.value.trim());
              }
            });
          }

          this.onSaveCallback(
            { question: qVal, correct_answer: aVal, distractors: this.dVals },
            this.activeFocusCard
          );
        }

        this.clearAllModalErrors();
        this.appNavController.closeModalById("modal-focus-edit");
        this.activeFocusCard = null;
      });
    }
  }

  /**
   * Updates Add/Remove button display based on distractor count.
   * @returns {void}
   */
  updateDistractorBtnStates() {
    logger.info("updateDistractorBtnStates called");
    if (!this.dContainer) return;
    const count = this.dContainer.children.length;
    logger.debug("Distractor count updated in focus modal", { count });
    if (this.addBtn)
      this.addBtn.style.display = count >= 6 ? "none" : "inline-flex";
    if (this.removeBtn)
      this.removeBtn.style.display = count <= 1 ? "none" : "inline-flex";
  }

  /**
   * Displays an error state and renders red descriptive error text below a modal input.
   * @param {HTMLElement | null} inputEl - The input element to apply the error state to.
   * @param {string} message - The error message text to display below the input.
   * @returns {void}
   */
  setModalFieldError(inputEl, message) {
    logger.warn("setModalFieldError called", { message });
    if (!inputEl || !inputEl.parentNode) return;
    if (inputEl.classList) inputEl.classList.add("input-error");
    let errorEl = inputEl.nextElementSibling;
    if (
      !errorEl ||
      !errorEl.classList ||
      !errorEl.classList.contains("field-error-message")
    ) {
      errorEl = document.createElement("span");
      errorEl.className = "field-error-message";
      inputEl.parentNode.insertBefore(errorEl, inputEl.nextSibling);
    }
    errorEl.textContent = message;
    logger.debug("Modal field error attached", { message });
  }

  /**
   * Clears error highlights and removes descriptive message from a modal input.
   * @param {HTMLElement | null} inputEl - The input element to clear the error state from.
   * @returns {void}
   */
  clearModalFieldError(inputEl) {
    if (!inputEl) return;
    if (inputEl.classList) inputEl.classList.remove("input-error");
    const errorEl = inputEl.nextElementSibling;
    if (
      errorEl &&
      errorEl.classList &&
      errorEl.classList.contains("field-error-message")
    ) {
      errorEl.remove();
    }
    logger.debug("Modal field error cleared");
  }

  /**
   * Clears all validation errors inside the focus modal.
   * @returns {void}
   */
  clearAllModalErrors() {
    logger.info("clearAllModalErrors called");
    logger.debug(
      "Clearing question, answer, and distractor field errors in focus modal"
    );
    this.clearModalFieldError(this.qInput);
    this.clearModalFieldError(this.aInput);
    if (this.dContainer) {
      this.dContainer.querySelectorAll(".d-input").forEach((d) => {
        if (d instanceof HTMLElement) {
          this.clearModalFieldError(d);
        }
      });
    }
  }

  /**
   * Validates that the focus modal has a non-empty question, answer, and 1 to 6 non-empty distractors without empty lines.
   * @returns {boolean} - True if valid, false otherwise.
   */
  validateFocusModal() {
    logger.info("validateFocusModal called");
    logger.debug("Executing focus modal validation checks");
    if (
      !(this.qInput instanceof HTMLTextAreaElement) ||
      !(this.aInput instanceof HTMLTextAreaElement) ||
      !this.dContainer
    ) {
      logger.warn("validateFocusModal failed: Missing essential modal inputs");
      return false;
    }

    this.qInput.value = this.qInput.value.trim();
    this.aInput.value = this.aInput.value.trim();

    this.clearAllModalErrors();
    let isValid = true;
    let focusHandled = false;

    if (!this.qInput.value) {
      this.setModalFieldError(
        this.qInput,
        "Question prompt is required and cannot be empty."
      );
      isValid = false;
      if (!focusHandled) {
        this.qInput.focus();
        focusHandled = true;
      }
    }

    if (!this.aInput.value) {
      this.setModalFieldError(
        this.aInput,
        "Correct answer is required and cannot be empty."
      );
      isValid = false;
      if (!focusHandled) {
        this.aInput.focus();
        focusHandled = true;
      }
    }

    const distractorInputs = this.dContainer.querySelectorAll(".d-input");
    if (distractorInputs.length === 0 || distractorInputs.length > 6) {
      logger.warn("Distractor count out of bounds", {
        count: distractorInputs.length
      });
      isValid = false;
    }

    distractorInputs.forEach((input) => {
      if (input instanceof HTMLTextAreaElement) {
        input.value = input.value.trim();
        if (!input.value) {
          this.setModalFieldError(
            input,
            "Distractor choice is required and cannot be empty."
          );
          isValid = false;
          if (!focusHandled) {
            input.focus();
            focusHandled = true;
          }
        }
      }
    });

    logger.info("Focus modal validation complete", { isValid });
    logger.debug("Focus modal validation state resolved", { isValid });
    return isValid;
  }

  /**
   * Opens the full-screen focus editing modal populated with the card's current values or empty for a new question.
   * @param {BuilderCardComponentType | null} [card] - The card to edit in focus mode, or null for creating a new question.
   * @param {((data: RawQuestionType, card: BuilderCardComponentType | null) => void) | null} [onSave] - Callback executing when changes are validated and committed securely.
   * @returns {void}
   */
  open(card = null, onSave = null) {
    logger.info("QuestionFocusModalComponent.open called", { card });
    this.activeFocusCard = card;
    if (onSave) this.onSaveCallback = onSave;

    const dContainer = this.dContainer;
    if (
      !(this.qInput instanceof HTMLTextAreaElement) ||
      !(this.aInput instanceof HTMLTextAreaElement) ||
      !dContainer
    ) {
      return;
    }

    if (this.modalTitle) {
      this.modalTitle.textContent = card
        ? "Edit Question Details"
        : "Add New Question";
    }
    if (this.modalBadge) {
      this.modalBadge.textContent = card
        ? "QUESTION FOCUS EDITOR"
        : "NEW QUESTION WORKSTATION";
    }

    this.clearAllModalErrors();
    this.qInput.value = card?.qInput ? card.qInput.value : "";
    this.aInput.value = card?.aInput ? card.aInput.value : "";

    dContainer.innerHTML = "";
    if (card?.dContainer) {
      const existingDistractors = card.dContainer.querySelectorAll(".d-input");
      existingDistractors.forEach((d) => {
        if (d instanceof HTMLTextAreaElement) {
          const input = document.createElement("textarea");
          input.className = "glass-input d-input";
          input.placeholder = "e.g., 80";
          input.value = d.value;
          dContainer.appendChild(input);
        }
      });
    }

    if (dContainer.children.length === 0) {
      const input = document.createElement("textarea");
      input.className = "glass-input d-input";
      input.placeholder = "e.g., 80";
      dContainer.appendChild(input);
    }

    this.updateDistractorBtnStates();

    logger.info("Focus modal opened and ready");
    logger.debug("Focus modal opened and populated", {
      isEdit: Boolean(card),
      distractorCount: dContainer.children.length
    });

    this.appNavController.openModalById("modal-focus-edit");

    setTimeout(() => {
      if (this.qInput instanceof HTMLElement) {
        logger.debug("Focusing focus modal qInput");
        this.qInput.focus();
      }
    }, 100);
  }
}
