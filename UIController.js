/**
 * @class UIController
 * @name UIController
 * @description 
 * Architectural Responsibilities: Encapsulates all DOM element caching, event listener bindings, 
 * and UI rendering operations for both the interactive quiz and the form builder. Acts as the 
 * sole bridge between the visual View layer and the underlying State models.
 * 
 * Encapsulation Scope: Strictly isolated to DOM manipulation. Reads physical inputs and 
 * fires visual transitions, but defers all business logic, scoring, and data parsing back 
 * to the Model layer.
 */
class UIController {
    
    // ====================================
    // --- DOM CACHING & INITIALIZATION ---
    // ====================================

    /**
     * @name constructor
     * @description Instantiates the controller, caches DOM references, and sets up event delegation.
     * @param {QuizState} quizState - The active instance of the state manager.
     * @returns {void} - Does not return a value.
     */
    constructor(quizState) {
        // Inject the state dependency so the UI controller can read from and write to the data layer.
        this.quizState = quizState;

        // Cache Quiz Session DOM Elements
        this.startScreen = document.getElementById("start-screen");
        this.quizScreen = document.getElementById("quiz-screen");
        this.resultScreen = document.getElementById("result-screen");
        this.startButton = document.getElementById("start-btn");
        this.questionText = document.getElementById("question-text");
        this.answersContainer = document.getElementById("answers-container");
        this.currentQuestionSpan = document.getElementById("current-question");
        this.totalQuestionsSpan = document.getElementById("totalQuestionsSpan");
        this.scoreSpan = document.getElementById("score");
        this.finalScoreSpan = document.getElementById("final-score");
        this.maxScoreSpan = document.getElementById("max-score");
        this.resultMessage = document.getElementById("result-message");
        this.restartButton = document.getElementById("restart-btn");
        this.progressBar = document.getElementById("progress");

        // Cache Data Loader DOM Elements
        this.fileInput = document.getElementById("custom-file-input");
        this.fileStatus = document.getElementById("file-name-display");
        this.resultFileInput = document.getElementById("result-file-input");
        this.resultFileStatus = document.getElementById("result-file-status");

        // Cache Builder DOM Elements
        this.builderContainer = document.getElementById("builder-questions-container");
        this.bulkImportText = document.getElementById("bulk-import-text");
        this.bulkImportStatus = document.getElementById("bulk-import-status");
        this.bulkImportPanel = document.getElementById("bulk-import-panel");

        /* Instantiates file processing dependencies immediately upon construction. */
        // ----------------------------------------------------------------------
        this.dataLoader = new QuizDataLoader(this.fileInput, this.fileStatus);
        this.resultDataLoader = new QuizDataLoader(this.resultFileInput, this.resultFileStatus);
        // ----------------------------------------------------------------------

        // Immediately bind static global events now that the DOM references exist.
        this.initializeEventListeners();
    }

    // =================================
    // --- EVENT LISTENER DELEGATION ---
    // =================================

    /**
     * @name initializeEventListeners
     * @description Binds static click events to the DOM to route user interactions.
     * @returns {void} - Does not return a value.
     */
    initializeEventListeners() {
        // Quiz Flow Bindings
        this.startButton.addEventListener("click", () => this.startQuiz());
        this.restartButton.addEventListener("click", () => this.restartQuiz());

        // Builder Bindings
        document.getElementById("btn-add-question").addEventListener("click", () => {
            // Evaluates existing DOM nodes for missing required data before appending a new card.
            if (this.validateBuilderCards()) {
                
                // Collapses all existing cards to preserve vertical screen space.
                const cards = this.builderContainer.querySelectorAll(".question-card");
                cards.forEach(c => c.classList.add("collapsed"));
                
                this.addBuilderQuestionCard();
                
                // Defers the scroll execution to ensure the DOM has painted the new card.
                setTimeout(() => {
                    this.builderContainer.scrollTo({
                        top: this.builderContainer.scrollHeight,
                        behavior: "smooth"
                    });
                }, 50);
            }
        });
        
        document.getElementById("btn-run-builder-quiz").addEventListener("click", () => this.startBuilderQuiz());
        document.getElementById("btn-export-quiz").addEventListener("click", () => this.exportBuilderQuiz());
        document.getElementById("btn-parse-bulk").addEventListener("click", () => this.handleBulkImport());

        // Toggles the advanced ingestion module panel.
        document.getElementById("bulk-import-header").addEventListener("click", () => {
            this.bulkImportPanel.classList.toggle("collapsed");
        });

        // Template Injections
        document.getElementById("btn-template-txt").addEventListener("click", () => {
            // Checks if the textarea is populated before aggressively throwing a warning
            if (this.bulkImportText.value.trim() !== "") {
                if (!PromptUtil.confirmAction("Inserting this template will overwrite your current text. Do you wish to continue?")) return;
            }
            this.bulkImportText.value = TemplateUtil.getTxtTemplate();
        });
        
        document.getElementById("btn-template-json").addEventListener("click", () => {
            if (this.bulkImportText.value.trim() !== "") {
                if (!PromptUtil.confirmAction("Inserting this template will overwrite your current text. Do you wish to continue?")) return;
            }
            this.bulkImportText.value = TemplateUtil.getJsonTemplate();
        });

        // Builder Clear All
        document.getElementById("btn-clear-builder").addEventListener("click", () => {
            // Bypasses the warning entirely if the builder is already empty
            if (this.builderContainer.children.length === 0) return;
            
            if (PromptUtil.confirmAction("Are you sure you want to clear all questions? This action cannot be undone.")) {
                this.builderContainer.innerHTML = "";
            }
        });

        // Result Screen Navigation
        document.getElementById("return-start-btn").addEventListener("click", () => {
            this.resultScreen.classList.remove("active");
            this.startScreen.classList.add("active");
        });
    }

    /**
     * @name extractAnswersFromDOM
     * @description Helper method to serialize input elements into an array of answer objects.
     * @param {string} correctText - Value from the correct answer input.
     * @param {NodeList} distractorInputs - Collection of distractor input nodes.
     * @returns {Array<Object>} - Formatted answer collection.
     */
    extractAnswersFromDOM(correctText, distractorInputs) {
        const answers = [];
        if (correctText) {
            answers.push({ text: correctText, correct: true });
        }
        distractorInputs.forEach(input => {
            const dText = input.value.trim();
            if (dText) {
                answers.push({ text: dText, correct: false });
            }
        });
        return answers;
    }

    // ===================================
    // --- QUIZ FLOW & RENDERING LOGIC ---
    // ===================================

    /**
     * @name synchronizeBounds
     * @description Synchronizes static UI bounds with the loaded dataset length.
     * @returns {void} - Does not return a value.
     */
    synchronizeBounds() {
        const totalCount = this.quizState.questionData.length;
        this.totalQuestionsSpan.textContent = totalCount;
        this.maxScoreSpan.textContent = totalCount;
    }

    /**
     * @name startQuiz
     * @description Starts a new quiz session and reveals the active screen.
     * @returns {void} - Does not return a value.
     */
    startQuiz() {
        const customPayload = this.resultDataLoader.getCustomData() || this.dataLoader.getCustomData();
        
        if (customPayload) {
            this.quizState = new QuizState(customPayload);
            this.synchronizeBounds();
        }

        this.quizState.resetQuiz();
        this.scoreSpan.textContent = this.quizState.score;
        
        this.startScreen.classList.remove("active");
        this.quizScreen.classList.add("active");
        
        this.showQuestion();
    }

    /**
     * @name showQuestion
     * @description Renders the current question and dynamically generates answer choices.
     * @returns {void} - Does not return a value.
     */
    showQuestion() {
        this.quizState.resetClickLock();
        
        const currentQuestion = this.quizState.getCurrentQuestion();
        
        this.currentQuestionSpan.textContent = this.quizState.index + 1;
        this.progressBar.style.width = `${this.quizState.getProgressPercentage()}%`;
        this.questionText.textContent = currentQuestion.question;
        
        this.answersContainer.innerHTML = "";
        
        currentQuestion.answers.forEach(answer => {
            const button = document.createElement("button");
            button.textContent = answer.text;
            button.classList.add("answer-btn");
            
            button.dataset.correct = answer.correct;
            button.addEventListener("click", (event) => this.selectAnswer(event));
            
            this.answersContainer.appendChild(button);
        });
    }

    // ===================================
    // --- EVALUATION & STATE MUTATION ---
    // ===================================

    /**
     * @name selectAnswer
     * @description Handles user selection, applies visual feedback, and defers navigation.
     * @param {Event} event - The button click event object.
     * @returns {void} - Does not return a value.
     */
    selectAnswer(event) {
        if (this.quizState.disabled) return;
        
        const selectedButton = event.target;
        const isCorrect = selectedButton.dataset.correct === "true";
        
        Array.from(this.answersContainer.children).forEach((button) => {
            button.classList.add(button.dataset.correct === "true" ? "correct" : "incorrect");
        });
        
        this.quizState.evaluateAnswer(isCorrect);
        this.scoreSpan.textContent = this.quizState.score;
        
        setTimeout(() => {
            this.quizState.advanceQuestion();
            
            if (this.quizState.isQuizOver()) {
                this.showResults();
            } else {
                this.showQuestion();
            }
        }, 3000);
    }

    // ===============================
    // --- TERMINAL STATE & RESETS ---
    // ===============================

    /**
     * @name showResults
     * @description Reveals the results view and updates final performance metrics.
     * @returns {void} - Does not return a value.
     */
    showResults() {
        this.quizScreen.classList.remove("active");
        this.resultScreen.classList.add("active");
        
        this.finalScoreSpan.textContent = this.quizState.score;
        
        const percentage = this.quizState.getGradePercentage();
        this.resultMessage.textContent = percentage + "%";
    }

    /**
     * @name restartQuiz
     * @description Resets screen routing and restarts the quiz session.
     * @returns {void} - Does not return a value.
     */
    restartQuiz() {
        this.resultScreen.classList.remove("active");
        this.startQuiz();
    }

    // ==================================
    // --- BUILDER UI & DOM INJECTION ---
    // ==================================

    /**
     * @name initializeBuilder
     * @description Initializes the creator environment, clearing previous states and injecting a foundational card.
     * @returns {void} - Does not return a value.
     */
    initializeBuilder() {
        // Clears any previous session data to ensure a pristine building environment.
        this.builderContainer.innerHTML = "";
        
        // Injects a foundational empty question block to guide the user.
        this.addBuilderQuestionCard();
    }

    /**
     * @name validateBuilderCards
     * @description Validates all rendered question cards to ensure strict schema requirements 
     * (Q, A, and at least 1 Distractor) are met before allowing the generation of new nodes.
     * @returns {boolean} - True if all cards are fully populated; false if validation fails.
     */
    validateBuilderCards() {
        const cards = this.builderContainer.querySelectorAll(".question-card");
        let isValid = true;

        cards.forEach(card => {
            const qInput = card.querySelector(".q-input");
            const aInput = card.querySelector(".a-input");
            const dInputs = card.querySelectorAll(".d-input");

            // Resets previous error states before evaluating
            qInput.classList.remove("input-error");
            aInput.classList.remove("input-error");
            dInputs.forEach(d => d.classList.remove("input-error"));

            // 1. Validate Question Prompt
            if (qInput.value.trim() === "") {
                qInput.classList.add("input-error");
                qInput.placeholder = "Required: Please enter a question prompt";
                isValid = false;
                card.classList.remove("collapsed"); // Forces visibility on the warning
            }

            // 2. Validate Correct Answer
            if (aInput.value.trim() === "") {
                aInput.classList.add("input-error");
                aInput.placeholder = "Required: Please enter the correct answer";
                isValid = false;
                card.classList.remove("collapsed"); // Forces visibility on the warning
            }

            // 3. Validate Distractors (Requires at least one populated field)
            let hasDistractor = false;
            dInputs.forEach(d => {
                if (d.value.trim() !== "") {
                    hasDistractor = true;
                }
            });

            if (!hasDistractor && dInputs.length > 0) {
                const firstDistractor = dInputs[0];
                firstDistractor.classList.add("input-error");
                firstDistractor.placeholder = "Required: Please enter at least one wrong answer";
                isValid = false;
                card.classList.remove("collapsed"); // Forces visibility on the warning
            }
        });

        return isValid;
    }

    /**
     * @name addBuilderQuestionCard
     * @description Constructs and injects a new interactive question block into the Builder DOM.
     * @param {Object} prefillData - Optional data payload for populating the inputs.
     * @returns {void} - Does not return a value.
     */
    addBuilderQuestionCard(prefillData = null) {
        const card = document.createElement("div");
        card.className = "glass-panel question-card";

        const questionVal = prefillData ? prefillData.question : "";
        let correctVal = "";
        let distractorVals = [""];

        /* Extracts answer strings from the prefill payload to map them to the correct input tiers. */
        // ----------------------------------------------------------------------
        if (prefillData && prefillData.answers) {
            const correctAns = prefillData.answers.find(a => a.correct);
            if (correctAns) correctVal = correctAns.text;

            const distractors = prefillData.answers.filter(a => !a.correct);
            if (distractors.length > 0) {
                distractorVals = distractors.map(d => d.text).slice(0, 6);
            }
        }
        // ----------------------------------------------------------------------

        const headerTitle = questionVal ? questionVal : "New Question...";

        // Injects the enhanced HTML structure.
        card.innerHTML = `
            <div class="card-header">
                <span class="card-title">${headerTitle}</span>
                
                <!-- Structural wrapper to dock the right-side icons together -->
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
                        ${distractorVals.map(val => `<input type="text" class="glass-input d-input" placeholder="e.g., 80" value="${val}">`).join('')}
                    </div>
                    
                    <button class="secondary-btn btn-add-distractor">+ Add Distractor</button>
                </div>
            </div>
        `;

        // Binds an event delegation listener to the card body to clear validation errors upon user input.
        card.querySelector(".card-body").addEventListener("input", (e) => {
            if (e.target.classList.contains("glass-input")) {
                e.target.classList.remove("input-error");
                
                // Restores the original placeholders based on the specific input tier
                if (e.target.classList.contains("q-input")) e.target.placeholder = "e.g., What is the default port for HTTPS?";
                if (e.target.classList.contains("a-input")) e.target.placeholder = "e.g., 443";
                if (e.target.classList.contains("d-input")) e.target.placeholder = "e.g., 80";
            }
        });

        const addBtn = card.querySelector(".btn-add-distractor");
        const deleteBtn = card.querySelector(".delete-icon-btn");
        const dContainer = card.querySelector(".distractors-container");
        const cardHeader = card.querySelector(".card-header");
        const qInput = card.querySelector(".q-input");
        const cardTitle = card.querySelector(".card-title");

        /* Binds local DOM events to govern card collapsibility, live text updates, and distractor limitations. */
        // ----------------------------------------------------------------------
        // Purges the entire card node from the DOM when triggered.
        deleteBtn.addEventListener("click", (event) => {
            // Terminates the event bubble phase to prevent the parent card header toggle from firing.
            event.stopPropagation();
            
            if (PromptUtil.confirmAction("Are you sure you want to delete this question?")) {
                card.remove();
            }
        });
        // ----------------------------------------------------------------------

        if (distractorVals.length >= 6) {
            addBtn.style.display = "none";
        }

        cardHeader.addEventListener("click", () => {
            card.classList.toggle("collapsed");
        });

        qInput.addEventListener("input", (e) => {
            cardTitle.textContent = e.target.value || "New Question...";
        });

        addBtn.addEventListener("click", () => {
            const currentCount = dContainer.querySelectorAll(".d-input").length;

            if (currentCount < 6) {
                const input = document.createElement("input");
                input.type = "text";
                input.className = "glass-input d-input";
                input.placeholder = "e.g., 8080";
                dContainer.appendChild(input);

                if (currentCount + 1 >= 6) {
                    addBtn.style.display = "none";
                }
            }
        });
        // ----------------------------------------------------------------------

        if (prefillData) {
            card.classList.add("collapsed");
        }

        this.builderContainer.appendChild(card);
    }

    /**
     * @name handleBulkImport
     * @description Intercepts raw text, delegates logic parsing to the DataLoader, and renders the UI changes.
     * @returns {void} - Does not return a value.
     */
    handleBulkImport() {
        const rawText = this.bulkImportText.value;

        // Bypasses execution if the field is empty.
        if (!rawText.trim()) return;

        // Resets previous error states.
        this.bulkImportStatus.classList.remove("error", "visible");
        this.bulkImportStatus.textContent = "";

        try {
            // Delegates the pure logic evaluation and validation to the DataLoader class.
            const parsedData = QuizDataLoader.processRawText(rawText);

            parsedData.forEach(q => this.addBuilderQuestionCard(q));
            this.bulkImportText.value = "";
            
        } catch (error) {
            console.error("Bulk parsing failed:", error);
            this.bulkImportStatus.textContent = `Error: ${error.message}`;
            this.bulkImportStatus.classList.add("error", "visible");
        }
    }

    /**
     * @name serializeBuilderForm
     * @description Scrapes the Builder DOM to serialize the visual form into a valid schema.
     * @returns {Array<Object>} - The compiled assessment dataset.
     */
    serializeBuilderForm() {
        const cards = this.builderContainer.querySelectorAll(".question-card");
        const finalJSON = [];

        /* Iterates through the physical DOM nodes to extract and format user input. */
        // ----------------------------------------------------------------------
        cards.forEach(card => {
            const qText = card.querySelector(".q-input").value.trim();
            const aText = card.querySelector(".a-input").value.trim();
            const dInputs = card.querySelectorAll(".d-input");

            // Bypasses the card entirely if the user left the primary question field blank.
            if (!qText) return;

            const answers = [];

            if (aText) {
                answers.push({ text: aText, correct: true });
            }

            dInputs.forEach(input => {
                const dText = input.value.trim();
                if (dText) {
                    answers.push({ text: dText, correct: false });
                }
            });

            finalJSON.push({
                question: qText,
                answers: answers
            });
        });
        // ----------------------------------------------------------------------

        return finalJSON;
    }

    /**
     * @name startBuilderQuiz
     * @description Validates the builder form, extracts the payload, and transitions directly into an active quiz session without downloading.
     * @returns {void} - Does not return a value.
     */
    startBuilderQuiz() {
        if (this.builderContainer.children.length === 0) {
            alert("Please add at least one question before starting the quiz.");
            return;
        }

        if (!this.validateBuilderCards()) {
            return;
        }

        const payload = this.serializeBuilderForm();
        
        if (payload.length === 0) {
            alert("Please complete at least one question before starting.");
            return;
        }

        this.quizState = new QuizState(payload);
        this.synchronizeBounds();
        this.quizState.resetQuiz();
        this.scoreSpan.textContent = this.quizState.score;

        document.getElementById("creator-screen").classList.remove("active");
        this.quizScreen.classList.add("active");

        this.showQuestion();
    }

    /**
     * @name exportBuilderQuiz
     * @description Extracts the view data and delegates the file generation to the export utility.
     * @returns {void} - Does not return a value.
     */
    exportBuilderQuiz() {
        // Scrapes the physical view for the current state.
        const payload = this.serializeBuilderForm();
        
        // Delegates the OS download action to the stateless utility class.
        FileExportUtil.downloadAsJSON(payload, "custom_quizset.json");
    }
}