import { confirmAction } from '../utils/prompts.js';
import { createLogger } from '../utils/logger.js';

/**
 * @class BuilderCardComponent
 * @name BuilderCardComponent
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
 * @description 
 * Architectural Responsibilities: A dedicated UI Component that encapsulates its own physical DOM node, string template rendering, localized event listeners, and physical validation states.
 * 
 * Encapsulation Scope: Extremely confined logic strictly tied to one specific question entry block.
 */
export default class BuilderCardComponent {

    /**
     * @name constructor
     * @public
     * @description Initializes the component, constructs the underlying DOM node, handles prefill data, and binds structural listeners.
     * @param {Object|null} prefillData - Optional question data to natively populate the inputs.
     * @param {Function} onDeleteCallback - The explicit action to fire when the local delete button is triggered.
     * @param {Function} [onExpandCallback] - Optional callback triggered to enforce external layout constraints natively.
     * @returns {void} - Does not return a value.
     */
    constructor(prefillData, onDeleteCallback, onExpandCallback = null) {
        this.logger = createLogger("BuilderCardComponent");
        this.logger.info("constructor called", { prefillData, onDeleteCallback, onExpandCallback });
        this.onDeleteCallback = onDeleteCallback;
        this.onExpandCallback = onExpandCallback;
        
        this.node = document.createElement("div");
        this.node.className = "glass-panel question-card";

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
     * @name render
     * @public
     * @description Processes internal string injection to structurally construct the component's interactive UI.
     * @param {Object|null} prefillData - Sourced data mapped directly into input values.
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
            const correctAns = prefillData.answers.find(a => {
                this.logger.trace("render: findCorrectAnswerCallback", { a });
                return a.correct;
            });
            if (correctAns) correctVal = correctAns.text;

            const distractors = prefillData.answers.filter(a => {
                this.logger.trace("render: filterDistractorsCallback", { a });
                return !a.correct;
            });
            if (distractors.length > 0) {
                distractorVals = distractors.map(d => {
                    this.logger.trace("render: mapDistractorsCallback", { d });
                    return d.text;
                }).slice(0, 6);
            }
        }
        // ----------------------------------------------------------------------

        const headerTitle = questionVal ? questionVal : "New Question...";

        this.node.innerHTML = `
            <div class="card-header">
                <span class="card-title">${headerTitle}</span>
                <div class="header-actions">
                    <button class="delete-icon-btn" title="Delete Question">&#10006;</button>
                    <span class="toggle-icon">▼</span>
                </div>
            </div>
            
            <div class="card-body">
                <div class="input-group">
                    <label class="input-label">Question</label>
                    <input type="text" class="glass-input q-input" placeholder="e.g., What is the default port for HTTPS?" value="${questionVal}">
                </div>
                
                <div class="input-group">
                    <label class="input-label correct-label">Correct Answer</label>
                    <input type="text" class="glass-input a-input correct-input" placeholder="e.g., 443" value="${correctVal}">
                </div>
                
                <div class="input-group">
                    <label class="input-label distractor-label">Distractors (Max 6)</label>
                    <div class="distractors-container">
                        ${distractorVals.map(val => {
                            this.logger.trace("render: mapDistractorHTMLCallback", { val });
                            return `<input type="text" class="glass-input d-input" placeholder="e.g., 80" value="${val}">`;
                        }).join('')}
                    </div>
                    <button class="secondary-btn btn-add-distractor">+ Add Distractor</button>
                </div>
            </div>
        `;

        this.qInput = this.node.querySelector(".q-input");
        this.aInput = this.node.querySelector(".correct-input");
        this.dContainer = this.node.querySelector(".distractors-container");
        this.addBtn = this.node.querySelector(".btn-add-distractor");
        
        if (distractorVals.length >= 6) {
            this.addBtn.style.display = "none";
        }

        this.logger.info("Builder card rendered", {
            questionText: questionVal || "New Question...",
            distractorCount: distractorVals.length
        });
    }

    /**
     * @name bindLocalListeners
     * @public
     * @description Attaches highly scoped physical DOM listeners to govern internal functionality seamlessly.
     * @returns {void} - Does not return a value.
     */
    bindLocalListeners() {
        this.logger.info("bindLocalListeners called");
        const deleteBtn = this.node.querySelector(".delete-icon-btn");
        const cardHeader = this.node.querySelector(".card-header");
        const cardTitle = this.node.querySelector(".card-title");

        deleteBtn.addEventListener("click", (event) => {
            this.logger.info("bindLocalListeners: onDeleteClick event", { event, title: cardTitle.textContent });
            event.stopPropagation();
            this.logger.info("Delete requested for builder card", {
                title: cardTitle.textContent
            });
            if (confirmAction("Are you sure you want to delete this question?")) {
                this.onDeleteCallback(this);
            }
        });

        cardHeader.addEventListener("click", () => {
            this.logger.info("bindLocalListeners: onHeaderClick event", { title: cardTitle.textContent });
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
            this.logger.trace("bindLocalListeners: onQuestionInput event", { value: e.target.value });
            cardTitle.textContent = e.target.value || "New Question...";
            this.logger.trace("Question text updated", {
                title: cardTitle.textContent
            });
        });

        this.addBtn.addEventListener("click", () => {
            this.logger.info("bindLocalListeners: onAddDistractorClick event");
            const currentCount = this.dContainer.querySelectorAll(".d-input").length;
            if (currentCount < 6) {
                const input = document.createElement("input");
                input.type = "text";
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

        this.node.querySelector(".card-body").addEventListener("input", (e) => {
            this.logger.trace("bindLocalListeners: onCardBodyInput event", { target: e.target });
            if (e.target.classList.contains("glass-input")) {
                e.target.classList.remove("input-error");
                
                if (e.target.classList.contains("q-input")) e.target.placeholder = "e.g., What is the default port for HTTPS?";
                if (e.target.classList.contains("a-input")) e.target.placeholder = "e.g., 443";
                if (e.target.classList.contains("d-input")) e.target.placeholder = "e.g., 80";

                this.logger.trace("Builder card input changed", {
                    fieldClass: Array.from(e.target.classList)
                });
            }
        });
    }

    /**
     * @name collapse
     * @public
     * @description Safely forces the DOM node into a constrained CSS visibility state.
     * @returns {void} - Does not return a value.
     */
    collapse() {
        this.logger.info("collapse called");
        this.node.classList.add("collapsed");
        this.logger.debug("Builder card collapsed");
    }

    /**
     * @name destroy
     * @public
     * @description Physically purges the internal template structure from the master DOM.
     * @returns {void} - Does not return a value.
     */
    destroy() {
        this.logger.info("destroy called");
        this.node.remove();
        this.logger.info("Builder card destroyed");
    }

    /**
     * @name validate
     * @public
     * @description Evaluates local input integrity to ensure required bounds are satisfied.
     * @returns {boolean} - True if populated properly; otherwise forces visibility uncollapse, renders red warnings, and returns false.
     */
    validate() {
        this.logger.info("validate called");
        this.logger.debug("Validating builder card");
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
        dInputs.forEach(d => {
            this.logger.trace("validate: distractorCheckCallback", { value: d.value });
            if (d.value.trim() !== "") {
                hasDistractor = true;
            }
        });

        if (!hasDistractor && dInputs.length > 0) {
            this.logger.warn("Validation error: No distractor text provided");
            const firstDistractor = dInputs[0];
            firstDistractor.classList.add("input-error");
            firstDistractor.placeholder = "Required: Please enter at least one wrong answer";
            isValid = false;
            this.node.classList.remove("collapsed");
        }

        this.logger.info("Builder card validation complete", { isValid });
        return isValid;
    }

    /**
     * @name getCardData
     * @public
     * @description Scrapes localized text inputs, discards empty references, and packages structural assessment objects.
     * @returns {Object|null} - Clean payload containing a single question structure, or null if the prompt was ignored.
     */
    getCardData() {
        this.logger.info("getCardData called");
        this.logger.trace("Serializing builder card data");
        const qText = this.qInput.value.trim();
        const aText = this.aInput.value.trim();
        const dInputs = this.node.querySelectorAll(".d-input");

        if (!qText) {
            this.logger.warn("Builder card skipped during serialization because question text is empty");
            return null;
        }

        const answers = [];

        if (aText) {
            answers.push({ text: aText, correct: true });
        }

        dInputs.forEach(input => {
            this.logger.trace("getCardData: distractorSerializeCallback", { value: input.value });
            const dText = input.value.trim();
            if (dText) {
                answers.push({ text: dText, correct: false });
            }
        });

        this.logger.debug("Card data serialized successfully", { question: qText, answerCount: answers.length });
        return {
            question: qText,
            answers: answers
        };
    }
}