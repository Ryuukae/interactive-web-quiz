import { confirmAction } from "../utils/prompts.js";
import { createLogger } from "../utils/logger.js";

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
 * @version 1.5.2
 * @author Adam Ross DeStafeno
 * @property {HTMLElement} node - The root DOM node of the component.
 * @property {HTMLTextAreaElement} [qInput] - The question prompt input field.
 * @property {HTMLTextAreaElement} [aInput] - The correct answer input field.
 * @property {HTMLElement} [dContainer] - The container for distractor input fields.
 * @property {HTMLElement} [addBtn] - The button to add more distractors.
 * @property {OnCardActionCallback} onDeleteCallback - Callback for deleting the card.
 * @property {OnCardActionCallback} [onExpandCallback] - Callback for expanding the card.
 * @typedef {import('../types.js').QuestionType} QuestionType
 * @typedef {import('../types.js').AnswerType} AnswerType
 */
export default class BuilderCardComponent {
  /**
   * Initializes the component, constructs the underlying DOM node, handles prefill data, and binds structural listeners.
   * @name constructor
   * @public
   * @param {QuestionType | null} prefillData - Optional question data to natively populate the inputs.
   * @param {OnCardActionCallback} onDeleteCallback - The explicit action to fire when the local delete button is triggered.
   * @param {OnCardActionCallback} [onExpandCallback] - Optional callback triggered to enforce external layout constraints natively.
   */
  constructor(prefillData, onDeleteCallback, onExpandCallback) {
    this.logger = createLogger("BuilderCardComponent");
    this.logger.info("constructor called", {
      prefillData,
      onDeleteCallback,
      onExpandCallback
    });

    this.onDeleteCallback = onDeleteCallback;
    this.onExpandCallback = onExpandCallback;

    this.node = document.createElement("div");
    this.node.className = "glass-panel question-card";

    // Declare properties explicitly to prevent engine errors prior to render()
    this.qInput = /** @type {HTMLTextAreaElement | undefined} */ (undefined);
    this.aInput = /** @type {HTMLTextAreaElement | undefined} */ (undefined);
    this.dContainer = /** @type {HTMLElement | undefined} */ (undefined);
    this.addBtn = /** @type {HTMLElement | undefined} */ (undefined);

    this.logger.info("Builder card created", {
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
   * @param {QuestionType | null} prefillData - Sourced data mapped directly into input values.
   * @throws {Error} - If critical builder card DOM nodes are missing.
   * @returns {void} - Does not return a value.
   */
  render(prefillData) {
    this.logger.info("render called", { prefillData });
    this.logger.debug("Rendering builder card", {
      hasPrefillData: Boolean(prefillData)
    });

    const questionVal = prefillData ? prefillData.question : "";
    let correctVal = "";
    let distractorVals = [""];

    /* Evaluates the prefill data to map raw strings into their correct tiered values explicitly. */
    // ----------------------------------------------------------------------
    if (prefillData && prefillData.answers) {
      const correctAns = prefillData.answers.find((a) => {
        this.logger.trace("render: findCorrectAnswerCallback", { a });
        return a.correct;
      });
      if (correctAns) correctVal = correctAns.text;

      const distractors = prefillData.answers.filter((a) => {
        this.logger.trace("render: filterDistractorsCallback", { a });
        return !a.correct;
      });
      if (distractors.length > 0) {
        distractorVals = distractors
          .map((d) => {
            this.logger.trace("render: mapDistractorsCallback", {
              d
            });
            return d.text;
          })
          .slice(0, 6);
      }
    }
    // ----------------------------------------------------------------------

    this.node.innerHTML = `
            <div class="card-header">
                <span class="card-title"></span>
                <div class="header-actions">
                    <button class="delete-icon-btn remove-card-btn" title="Delete Question">&#10006;</button>
                    <span class="toggle-icon">▼</span>
                </div>
            </div>
            
            <div class="card-body">
                <div class="input-group">
                    <label class="input-label">Question</label>
                    <textarea class="glass-input q-input question-input" rows="3" placeholder="e.g., What is the default port for HTTPS?"></textarea>
                </div>
                
                <div class="input-group answer-row correct-row">
                    <label class="input-label correct-label">Correct Answer</label>
                    <textarea class="glass-input a-input correct-input" rows="3" placeholder="e.g., 443"></textarea>
                </div>
                
                <div class="input-group answer-row distractor-row">
                    <label class="input-label distractor-label">Distractors (Max 6)</label>
                    <div class="distractors-container"></div>
                    <button class="secondary-btn btn-add-distractor">+ Add Distractor</button>
                </div>
            </div>
        `;

    const cardTitleNode = this.node.querySelector(".card-title");
    const qInputNode = this.node.querySelector(".q-input");
    const aInputNode = this.node.querySelector(".correct-input");
    const dContainerNode = this.node.querySelector(".distractors-container");
    const addBtnNode = this.node.querySelector(".btn-add-distractor");

    if (
      !(cardTitleNode instanceof HTMLElement) ||
      !(qInputNode instanceof HTMLTextAreaElement) ||
      !(aInputNode instanceof HTMLTextAreaElement) ||
      !(dContainerNode instanceof HTMLElement) ||
      !(addBtnNode instanceof HTMLElement)
    ) {
      throw new Error("Critical builder card DOM nodes missing");
    }

    cardTitleNode.textContent = questionVal ? questionVal : "New Question...";
    qInputNode.value = questionVal;
    aInputNode.value = correctVal;

    distractorVals.forEach((val) => {
      this.logger.trace("render: creating distractor input", { val });
      const distractorInput = document.createElement("textarea");
      distractorInput.rows = 3;
      distractorInput.className = "glass-input d-input";
      distractorInput.placeholder = "e.g., 80";
      distractorInput.value = val;
      dContainerNode.appendChild(distractorInput);
    });

    this.qInput = qInputNode;
    this.aInput = aInputNode;
    this.dContainer = dContainerNode;
    this.addBtn = addBtnNode;

    if (distractorVals.length >= 6) {
      this.addBtn.style.display = "none";
    }

    this.logger.info("Builder card rendered", {
      questionText: questionVal || "New Question...",
      distractorCount: distractorVals.length
    });
  }

  /**
   * Attaches highly scoped physical DOM listeners to govern internal functionality seamlessly.
   * @name bindLocalListeners
   * @public
   * @returns {void} - Does not return a value.
   */
  bindLocalListeners() {
    this.logger.info("bindLocalListeners called");
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
      this.logger.error("Missing critical nodes for card interactions");
      return;
    }

    deleteBtn.addEventListener("click", (event) => {
      this.logger.info("bindLocalListeners: onDeleteClick event", {
        event,
        title: cardTitle.textContent
      });
      event.stopPropagation();
      this.logger.info("Delete requested for builder card", {
        title: cardTitle.textContent
      });
      if (confirmAction("Are you sure you want to delete this question?")) {
        this.onDeleteCallback(this);
      }
    });

    cardHeader.addEventListener("click", () => {
      this.logger.info("bindLocalListeners: onHeaderClick event", {
        title: cardTitle.textContent
      });
      const isNowCollapsed = this.node.classList.toggle("collapsed");
      this.logger.debug("Builder card toggle requested", {
        collapsed: isNowCollapsed,
        title: cardTitle.textContent
      });

      if (!isNowCollapsed && this.onExpandCallback) {
        this.onExpandCallback(this);
      }
    });

    this.qInput.addEventListener("input", (e) => {
      if (!(e.target instanceof HTMLTextAreaElement)) return;
      this.logger.trace("bindLocalListeners: onQuestionInput event", {
        value: e.target.value
      });
      cardTitle.textContent = e.target.value || "New Question...";
      this.logger.trace("Question text updated", {
        title: cardTitle.textContent
      });
    });

    if (!this.addBtn || !this.dContainer) return;
    this.addBtn.addEventListener("click", () => {
      this.logger.info("bindLocalListeners: onAddDistractorClick event");
      if (!this.dContainer || !this.addBtn) return;
      const currentCount = this.dContainer.querySelectorAll(".d-input").length;
      if (currentCount < 6) {
        const input = document.createElement("textarea");
        input.rows = 3;
        input.className = "glass-input d-input";
        input.placeholder = "e.g., 8080";
        this.dContainer.appendChild(input);

        this.logger.info("Distractor input added", {
          title: cardTitle.textContent,
          distractorCount: currentCount + 1
        });

        if (currentCount + 1 >= 6) {
          this.addBtn.style.display = "none";
        }
      }
    });

    cardBody.addEventListener("input", (e) => {
      if (!(e.target instanceof HTMLTextAreaElement)) return;
      this.logger.trace("bindLocalListeners: onCardBodyInput event", {
        target: e.target
      });
      if (e.target.classList.contains("glass-input")) {
        e.target.classList.remove("input-error");

        if (e.target.classList.contains("q-input")) {
          e.target.placeholder = "e.g., What is the default port for HTTPS?";
        }
        if (e.target.classList.contains("a-input")) {
          e.target.placeholder = "e.g., 443";
        }
        if (e.target.classList.contains("d-input")) {
          e.target.placeholder = "e.g., 80";
        }

        this.logger.trace("Builder card input changed", {
          fieldClass: Array.from(e.target.classList)
        });
      }
    });
  }

  /**
   * Safely forces the DOM node into a constrained CSS visibility state.
   * @name collapse
   * @public
   * @returns {void} - Does not return a value.
   */
  collapse() {
    this.logger.info("collapse called");
    this.node.classList.add("collapsed");
    this.logger.debug("Builder card collapsed");
  }

  /**
   * Physically purges the internal template structure from the master DOM.
   * @name destroy
   * @public
   * @returns {void} - Does not return a value.
   */
  destroy() {
    this.logger.info("destroy called");
    this.node.remove();
    this.logger.info("Builder card destroyed");
  }

  /**
   * Evaluates local input integrity to ensure required bounds are satisfied.
   * @name validate
   * @public
   * @returns {boolean} - True if populated properly; otherwise forces visibility uncollapse, renders red warnings, and returns false.
   */
  validate() {
    this.logger.info("validate called");
    this.logger.debug("Validating builder card");

    if (!this.qInput || !this.aInput || !this.dContainer) return false;

    let isValid = true;
    const dInputs = this.node.querySelectorAll(".d-input");

    if (this.qInput.value.trim() === "") {
      this.logger.warn("Validation error: Question prompt is empty");
      this.qInput.classList.add("input-error");
      this.qInput.placeholder = "Required: Please enter a question prompt";
      isValid = false;
      this.node.classList.remove("collapsed");
    }

    if (this.aInput.value.trim() === "") {
      this.logger.warn("Validation error: Correct answer is empty");
      this.aInput.classList.add("input-error");
      this.aInput.placeholder = "Required: Please enter the correct answer";
      isValid = false;
      this.node.classList.remove("collapsed");
    }

    let hasDistractor = false;
    dInputs.forEach((d) => {
      if (!(d instanceof HTMLTextAreaElement)) return;
      this.logger.trace("validate: distractorCheckCallback", {
        value: d.value
      });
      if (d.value.trim() !== "") {
        hasDistractor = true;
      }
    });

    if (!hasDistractor && dInputs.length > 0) {
      this.logger.warn("Validation error: No distractor text provided");
      const firstDistractor = dInputs[0];
      if (firstDistractor instanceof HTMLTextAreaElement) {
        firstDistractor.classList.add("input-error");
        firstDistractor.placeholder =
          "Required: Please enter at least one wrong answer";
      }
      isValid = false;
      this.node.classList.remove("collapsed");
    }

    this.logger.info("Builder card validation complete", { isValid });
    return isValid;
  }

  /**
   * Scrapes localized text inputs, discards empty references, and packages structural assessment objects.
   * @name getCardData
   * @public
   * @returns {QuestionType | null} - Clean payload containing a single question structure, or null if the prompt was ignored.
   */
  getCardData() {
    this.logger.info("getCardData called");
    this.logger.trace("Serializing builder card data");
    if (!this.qInput || !this.aInput || !this.dContainer) return null;

    const qText = this.qInput.value.trim();
    const aText = this.aInput.value.trim();
    const dInputs = this.node.querySelectorAll(".d-input");

    if (!qText) {
      this.logger.warn(
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
      this.logger.trace("getCardData: distractorSerializeCallback", {
        value: input.value
      });
      const dText = input.value.trim();
      if (dText) {
        answers.push({ text: dText, correct: false });
      }
    });

    this.logger.debug("Card data serialized successfully", {
      question: qText,
      answerCount: answers.length
    });
    return {
      question: qText,
      answers: answers
    };
  }
}
