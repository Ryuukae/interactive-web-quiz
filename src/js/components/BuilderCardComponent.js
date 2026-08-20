import { confirmAction } from "../utils/prompts.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("BuilderCardComponent");

/**
 * Callback triggered by specific card actions.
 * @callback OnCardActionCallback
 * @param {BuilderCardComponent} card - The builder card component instance.
 * @returns {void} - Does not return a value.
 */

/**
 * UI component representing a single question entry block in the quiz builder.
 * Manages its own DOM rendering, local event listeners, and validation state.
 *
 * @class BuilderCardComponent
 * @name BuilderCardComponent
 * @version 1.6.3
 * @author Adam Ross DeStafeno
 * @property {HTMLElement} node - The root DOM node of the component.
 * @property {HTMLTextAreaElement | null} qInput - The question prompt input field.
 * @property {HTMLTextAreaElement | null} aInput - The correct answer input field.
 * @property {HTMLElement | null} dContainer - The container for distractor input fields.
 * @property {HTMLElement | null} addBtn - The button to add more distractors.
 * @property {OnCardActionCallback} onDeleteCallback - Callback for deleting the card.
 * @property {OnCardActionCallback} [onExpandCallback] - Callback for expanding the card.
 * @property {OnCardActionCallback} [onFocusCallback] - Callback for focus editing the card.
 * @typedef {import('../types.js').QuestionType} QuestionType
 * @typedef {import('../types.js').AnswerType} AnswerType
 * @typedef {import('../types.js').RawQuestionType} RawQuestionType
 * @typedef {import('../types.js').BuilderCardPrefillType} BuilderCardPrefillType
 */
export default class BuilderCardComponent {
  /**
   * Initializes the component, constructs the underlying DOM node, handles prefill data, and binds structural listeners.
   * @name constructor
   * @public
   * @param {BuilderCardPrefillType | null} prefillData - Optional question data to natively populate the inputs.
   * @param {OnCardActionCallback} onDeleteCallback - The explicit action to fire when the local delete button is triggered.
   * @param {OnCardActionCallback} [onExpandCallback] - Optional callback triggered to enforce external layout constraints natively.
   * @param {OnCardActionCallback} [onFocusCallback] - Optional callback triggered to open full-screen focus modal.
   */
  constructor(
    prefillData,
    onDeleteCallback,
    onExpandCallback,
    onFocusCallback
  ) {
    logger.info("constructor called", {
      prefillData,
      onDeleteCallback,
      onExpandCallback,
      onFocusCallback
    });
    logger.debug("Instantiating BuilderCardComponent instance", {
      hasPrefill: Boolean(prefillData)
    });

    this.onDeleteCallback = onDeleteCallback;
    this.onExpandCallback = onExpandCallback;
    this.onFocusCallback = onFocusCallback;

    this.node = document.createElement("div");
    this.node.className = "glass-panel question-card";

    // Declare properties explicitly to prevent engine errors prior to render()
    this.qInput = null;
    this.aInput = null;
    this.dContainer = null;
    this.addBtn = null;

    logger.info("Builder card created", {
      hasPrefillData: Boolean(prefillData)
    });

    this.render(prefillData);
    this.bindLocalListeners();

    if (prefillData) {
      this.collapse();
    }
  }

  /**
   * Processes internal string injection to structurally construct the component's interactive UI.
   * @name render
   * @public
   * @param {BuilderCardPrefillType | null} [prefillData] - Sourced data mapped directly into input values.
   * @throws {Error} - If critical builder card DOM nodes are missing.
   * @returns {void} - Does not return a value.
   */
  render(prefillData) {
    logger.info("render called", { prefillData });
    logger.debug("Rendering builder card", {
      hasPrefillData: Boolean(prefillData)
    });

    const questionVal = prefillData ? prefillData.question : "";
    let correctVal = "";
    let distractorVals = [""];

    /* Evaluates the prefill data to map raw strings into their correct tiered values explicitly. */
    // ----------------------------------------------------------------------
    if (
      prefillData &&
      "answers" in prefillData &&
      Array.isArray(prefillData.answers)
    ) {
      const correctAns = prefillData.answers.find((a) => {
        logger.trace("render: findCorrectAnswerCallback", { a });
        return a.correct;
      });
      if (correctAns) correctVal = correctAns.text;

      const distractors = prefillData.answers.filter((a) => {
        logger.trace("render: filterDistractorsCallback", { a });
        return !a.correct;
      });
      if (distractors.length > 0) {
        distractorVals = distractors
          .map((d) => {
            logger.trace("render: mapDistractorsCallback", {
              d
            });
            return d.text;
          })
          .slice(0, 6);
      }
    } else if (
      prefillData &&
      ("correct_answer" in prefillData || "distractors" in prefillData)
    ) {
      if (prefillData.correct_answer) {
        correctVal = prefillData.correct_answer;
      }
      if (
        Array.isArray(prefillData.distractors) &&
        prefillData.distractors.length > 0
      ) {
        distractorVals = prefillData.distractors
          .map((d) => (typeof d === "string" ? d : (d && d.text) || ""))
          .slice(0, 6);
      }
    }
    // ----------------------------------------------------------------------

    this.node.innerHTML = `
            <div class="card-header">
                <div class="card-title-group">
                    <span class="card-pill">Q</span>
                    <span class="card-title"></span>
                </div>
                <div class="header-actions">
                    <button class="header-action-btn expand-modal-icon-btn focus-card-btn" title="Focus Edit Question" aria-label="Open full-screen question editor">&#x26F6;</button>
                    <button class="header-action-btn delete-icon-btn remove-card-btn" title="Delete Question" aria-label="Delete this question">&#10006;</button>
                    <span class="toggle-icon" aria-hidden="true">▼</span>
                </div>
            </div>
            
            <div class="card-body">
                <div class="input-group">
                    <label class="input-label">
                        <span class="label-dot dot-q"></span>Question Prompt
                    </label>
                    <textarea class="glass-input q-input question-input" rows="2" placeholder="e.g., What is the default port for HTTPS?"></textarea>
                </div>
                
                <div class="input-group answer-row correct-row">
                    <label class="input-label correct-label">
                        <span class="label-dot dot-a"></span>Correct Answer
                    </label>
                    <textarea class="glass-input a-input correct-input" rows="2" placeholder="e.g., 443"></textarea>
                </div>
                
                <div class="input-group answer-row distractor-row">
                    <label class="input-label distractor-label">
                        <span class="label-dot dot-d"></span>Distractors (Wrong Choices — Max 6)
                    </label>
                    <div class="distractors-container"></div>
                    <div class="distractor-actions">
                        <button type="button" class="secondary-btn btn-add-distractor">+ Add Distractor</button>
                        <button type="button" class="secondary-btn btn-remove-distractor">&minus; Remove Distractor</button>
                    </div>
                </div>
            </div>
        `;

    const cardTitleNode = this.node.querySelector(".card-title");
    const qInputNode = this.node.querySelector(".q-input");
    const aInputNode = this.node.querySelector(".correct-input");
    const dContainerNode = this.node.querySelector(".distractors-container");
    const addBtnNode = this.node.querySelector(".btn-add-distractor");
    const removeBtnNode = this.node.querySelector(".btn-remove-distractor");

    if (
      !(cardTitleNode instanceof HTMLElement) ||
      !(qInputNode instanceof HTMLTextAreaElement) ||
      !(aInputNode instanceof HTMLTextAreaElement) ||
      !(dContainerNode instanceof HTMLElement) ||
      !(addBtnNode instanceof HTMLElement) ||
      !(removeBtnNode instanceof HTMLElement)
    ) {
      throw new Error("Critical builder card DOM nodes missing");
    }

    cardTitleNode.textContent = questionVal ? questionVal : "New Question...";
    qInputNode.value = questionVal;
    aInputNode.value = correctVal;

    distractorVals.forEach((val) => {
      logger.trace("render: creating distractor input", { val });
      const distractorInput = document.createElement("textarea");
      distractorInput.rows = 2;
      distractorInput.className = "glass-input d-input";
      distractorInput.placeholder = "e.g., 80";
      distractorInput.value = val;
      dContainerNode.appendChild(distractorInput);
    });

    this.qInput = qInputNode;
    this.aInput = aInputNode;
    this.dContainer = dContainerNode;
    this.addBtn = addBtnNode;
    this.removeBtn = removeBtnNode;

    if (distractorVals.length >= 6) {
      this.addBtn.style.display = "none";
    }
    if (distractorVals.length <= 1) {
      this.removeBtn.style.display = "none";
    }

    logger.info("Builder card rendered", {
      questionText: questionVal || "New Question...",
      distractorCount: distractorVals.length
    });
    logger.debug("Card HTML nodes wired to component instance");
  }

  /**
   * Attaches highly scoped physical DOM listeners to govern internal functionality seamlessly.
   * @name bindLocalListeners
   * @public
   * @returns {void} - Does not return a value.
   */
  bindLocalListeners() {
    logger.info("bindLocalListeners called");
    logger.debug(
      "Attaching local card header, input, and distractor button listeners"
    );

    const focusBtn = this.node.querySelector(".expand-modal-icon-btn");
    const deleteBtn = this.node.querySelector(".delete-icon-btn");
    const cardHeader = this.node.querySelector(".card-header");
    const cardTitle = this.node.querySelector(".card-title");
    const cardBody = this.node.querySelector(".card-body");

    if (
      !(deleteBtn instanceof HTMLElement) ||
      !(cardHeader instanceof HTMLElement) ||
      !(cardTitle instanceof HTMLElement) ||
      !(cardBody instanceof HTMLElement) ||
      !this.qInput ||
      !this.aInput ||
      !this.addBtn ||
      !this.dContainer
    ) {
      logger.error("Missing critical nodes for card interactions");
      return;
    }

    if (focusBtn instanceof HTMLElement) {
      focusBtn.addEventListener("click", (event) => {
        logger.info("bindLocalListeners: onFocusClick event", {
          title: cardTitle.textContent
        });
        logger.debug("Triggering focus modal callback for card");
        event.stopPropagation();
        if (this.onFocusCallback) {
          this.onFocusCallback(this);
        }
      });
    }

    deleteBtn.addEventListener("click", (event) => {
      logger.info("bindLocalListeners: onDeleteClick event", {
        event,
        title: cardTitle.textContent
      });
      event.stopPropagation();
      logger.info("Delete requested for builder card", {
        title: cardTitle.textContent
      });
      if (confirmAction("Are you sure you want to delete this question?")) {
        logger.debug("User confirmed card deletion");
        this.onDeleteCallback(this);
      }
    });

    cardHeader.addEventListener("click", () => {
      logger.info("bindLocalListeners: onHeaderClick event", {
        title: cardTitle.textContent
      });
      const isNowCollapsed = this.node.classList.toggle("collapsed");
      logger.debug("Builder card toggle requested", {
        collapsed: isNowCollapsed,
        title: cardTitle.textContent
      });

      if (!isNowCollapsed) {
        if (this.qInput) this.autoExpand(this.qInput);
        if (this.aInput) this.autoExpand(this.aInput);
        if (this.dContainer) {
          this.dContainer
            .querySelectorAll(".d-input")
            .forEach((el) => this.autoExpand(el));
        }
        if (this.onExpandCallback) {
          this.onExpandCallback(this);
        }
      }
    });

    this.qInput.addEventListener("input", (e) => {
      if (!(e.target instanceof HTMLTextAreaElement)) return;
      logger.trace("bindLocalListeners: onQuestionInput event", {
        value: e.target.value
      });
      cardTitle.textContent = e.target.value || "New Question...";
      logger.trace("Question text updated", {
        title: cardTitle.textContent
      });
    });

    const updateDistractorBtnStates = () => {
      if (!this.dContainer) return;
      const count = this.dContainer.querySelectorAll(".d-input").length;
      if (this.addBtn) {
        this.addBtn.style.display = count >= 6 ? "none" : "inline-flex";
      }
      if (this.removeBtn) {
        this.removeBtn.style.display = count <= 1 ? "none" : "inline-flex";
      }
    };
    this.updateDistractorButtonStates = updateDistractorBtnStates;

    if (this.addBtn && this.dContainer) {
      this.addBtn.addEventListener("click", () => {
        logger.info("bindLocalListeners: onAddDistractorClick event");
        if (!this.dContainer) return;
        const currentCount =
          this.dContainer.querySelectorAll(".d-input").length;
        if (currentCount < 6) {
          const input = document.createElement("textarea");
          input.rows = 2;
          input.className = "glass-input d-input";
          input.placeholder = "e.g., 8080";
          this.dContainer.appendChild(input);
          this.autoExpand(input);
          updateDistractorBtnStates();

          logger.info("Distractor input added", {
            title: cardTitle.textContent,
            distractorCount: currentCount + 1
          });
          logger.debug("Appended new distractor input textarea to card");
        }
      });
    }

    if (this.removeBtn && this.dContainer) {
      this.removeBtn.addEventListener("click", () => {
        logger.info("bindLocalListeners: onRemoveDistractorClick event");
        if (!this.dContainer) return;
        const distractors = this.dContainer.querySelectorAll(".d-input");
        if (distractors.length > 1) {
          const lastDistractor = distractors[distractors.length - 1];
          lastDistractor.remove();
          updateDistractorBtnStates();

          logger.info("Distractor input removed", {
            title: cardTitle.textContent,
            distractorCount: this.dContainer.querySelectorAll(".d-input").length
          });
          logger.debug("Purged last distractor textarea from card");
        }
      });
    }

    cardBody.addEventListener("input", (e) => {
      if (!(e.target instanceof HTMLTextAreaElement)) return;
      this.autoExpand(e.target);
      logger.trace("bindLocalListeners: onCardBodyInput event", {
        target: e.target
      });
      if (e.target.classList.contains("glass-input")) {
        this.clearFieldError(e.target);

        if (e.target.classList.contains("q-input")) {
          e.target.placeholder = "e.g., What is the default port for HTTPS?";
        }
        if (e.target.classList.contains("a-input")) {
          e.target.placeholder = "e.g., 443";
        }
        if (e.target.classList.contains("d-input")) {
          e.target.placeholder = "e.g., 80";
        }

        logger.trace("Builder card input changed", {
          fieldClass: Array.from(e.target.classList)
        });
      }
    });

    setTimeout(() => {
      if (this.qInput) this.autoExpand(this.qInput);
      if (this.aInput) this.autoExpand(this.aInput);
      if (this.dContainer) {
        this.dContainer
          .querySelectorAll(".d-input")
          .forEach((el) => this.autoExpand(el));
      }
    }, 0);
  }

  /**
   * Auto-expands the textarea height to fit its content without inner scrollbars.
   * @param {Element | null} textarea - The textarea element to resize.
   * @returns {void}
   */
  autoExpand(textarea) {
    if (!(textarea instanceof HTMLTextAreaElement)) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(48, textarea.scrollHeight)}px`;
  }

  /**
   * Safely forces the DOM node into a constrained CSS visibility state.
   * @name collapse
   * @public
   * @returns {void} - Does not return a value.
   */
  collapse() {
    logger.info("collapse called");
    this.node.classList.add("collapsed");
    logger.debug("Builder card collapsed");
  }

  /**
   * Physically purges the internal template structure from the master DOM.
   * @name destroy
   * @public
   * @returns {void} - Does not return a value.
   */
  destroy() {
    logger.info("destroy called");
    this.node.remove();
    logger.info("Builder card destroyed");
    logger.debug("Card element unmounted from DOM tree");
  }

  /**
   * Displays an error state and creates a descriptive red message below an input.
   * @param {HTMLElement | null} inputEl - Target input node.
   * @param {string} message - Error description to display.
   */
  setFieldError(inputEl, message) {
    if (!inputEl || !inputEl.parentNode) return;
    inputEl.classList.add("input-error");
    let errorEl = inputEl.nextElementSibling;
    if (!errorEl || !errorEl.classList.contains("field-error-message")) {
      errorEl = document.createElement("span");
      errorEl.className = "field-error-message";
      inputEl.parentNode.insertBefore(errorEl, inputEl.nextSibling);
    }
    errorEl.textContent = message;
    logger.debug("Field error set on card input", { message });
  }

  /**
   * Clears error highlights and removes descriptive message from an input.
   * @param {HTMLElement | null} inputEl - Target input node.
   */
  clearFieldError(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove("input-error");
    const errorEl = inputEl.nextElementSibling;
    if (errorEl && errorEl.classList.contains("field-error-message")) {
      errorEl.remove();
    }
    logger.debug("Field error cleared from card input");
  }

  /**
   * Clears all validation errors across this card.
   */
  clearAllErrors() {
    this.clearFieldError(this.qInput);
    this.clearFieldError(this.aInput);
    if (this.dContainer) {
      const distractorInputs = this.dContainer.querySelectorAll(".d-input");
      distractorInputs.forEach((d) => {
        if (d instanceof HTMLElement) {
          this.clearFieldError(d);
        }
      });
    }
    logger.debug("All field errors cleared from card");
  }

  /**
   * Evaluates local input integrity to ensure required bounds are satisfied.
   * @name validate
   * @public
   * @returns {boolean} - True if populated properly; otherwise forces visibility uncollapse, renders red warnings, and returns false.
   */
  validate() {
    logger.info("validate called");
    logger.debug("Validating builder card fields");

    if (!this.qInput || !this.aInput || !this.dContainer) return false;

    // Automatically trim leading and trailing blank lines/whitespace
    this.qInput.value = this.qInput.value.trim();
    this.aInput.value = this.aInput.value.trim();

    this.clearAllErrors();
    let isValid = true;
    const dInputs = this.node.querySelectorAll(".d-input");

    if (this.qInput.value === "") {
      logger.warn("Validation error: Question prompt is empty");
      this.setFieldError(
        this.qInput,
        "Question prompt is required and cannot be empty."
      );
      isValid = false;
      this.node.classList.remove("collapsed");
    }

    if (this.aInput.value === "") {
      logger.warn("Validation error: Correct answer is empty");
      this.setFieldError(
        this.aInput,
        "Correct answer is required and cannot be empty."
      );
      isValid = false;
      this.node.classList.remove("collapsed");
    }

    let hasDistractor = false;
    dInputs.forEach((d) => {
      if (!(d instanceof HTMLTextAreaElement)) return;
      d.value = d.value.trim();
      logger.trace("validate: distractorCheckCallback", {
        value: d.value
      });
      if (d.value !== "") {
        hasDistractor = true;
      }
    });

    if (!hasDistractor && dInputs.length > 0) {
      logger.warn("Validation error: No distractor text provided");
      dInputs.forEach((d) => {
        if (d instanceof HTMLTextAreaElement && d.value === "") {
          this.setFieldError(
            d,
            "At least one wrong answer distractor choice is required."
          );
        }
      });
      isValid = false;
      this.node.classList.remove("collapsed");
    }

    logger.info("Builder card validation complete", { isValid });
    logger.debug("Builder card validation resolution", { isValid });
    return isValid;
  }

  /**
   * Scrapes localized text inputs, discards empty references, and packages structural assessment objects.
   * @name getCardData
   * @public
   * @returns {QuestionType | null} - Clean payload containing a single question structure, or null if the prompt was ignored.
   */
  getCardData() {
    logger.info("getCardData called");
    logger.debug("Serializing builder card data to question payload");
    if (!this.qInput || !this.aInput || !this.dContainer) return null;

    const qText = this.qInput.value.trim();
    const aText = this.aInput.value.trim();
    const dInputs = this.node.querySelectorAll(".d-input");

    if (!qText) {
      logger.warn(
        "Builder card skipped during serialization because question text is empty"
      );
      return null;
    }

    const answers = [];

    if (aText) {
      answers.push({ text: aText, correct: true });
    }

    dInputs.forEach((input) => {
      if (!(input instanceof HTMLTextAreaElement)) return;
      logger.trace("getCardData: distractorSerializeCallback", {
        value: input.value
      });
      const dText = input.value.trim();
      if (dText) {
        answers.push({ text: dText, correct: false });
      }
    });

    logger.debug("Card data serialized successfully", {
      question: qText,
      answerCount: answers.length
    });
    return {
      question: qText,
      answers: answers
    };
  }
}
