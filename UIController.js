/**
 * UIController
 * 
 * Architectural Responsibilities: Encapsulates all DOM element caching, event listener bindings, 
 * and UI rendering operations for both the interactive quiz and the form builder. Acts as the 
 * sole bridge between the visual View layer and the underlying State models.
 * 
 * Encapsulation Scope: Strictly isolated to DOM manipulation. Reads physical inputs and 
 * fires visual transitions, but defers all business logic, scoring, and data parsing back 
 * to the Model layer.
 */
class UIController {
    
    // ==========================================
    // --- DOM CACHING & INITIALIZATION ---
    // ==========================================

    /**
     * Instantiates the controller, caches DOM references, and sets up event delegation.
     * 
     * @param {QuizState} quizState - The active instance of the state manager.
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

    // ==========================================
    // --- EVENT LISTENER DELEGATION ---
    // ==========================================

    /**
     * Binds static click events to the DOM to route user interactions.
     * 
     * @returns {void} - Does not return a value.
     */
    initializeEventListeners() {
        // Quiz Flow Bindings
        this.startButton.addEventListener("click", () => this.startQuiz());
        this.restartButton.addEventListener("click", () => this.restartQuiz());

        // Builder Bindings
        document.getElementById("btn-add-question").addEventListener("click", () => this.addBuilderQuestionCard());
        document.getElementById("btn-export-quiz").addEventListener("click", () => this.exportBuilderQuiz());
        document.getElementById("btn-parse-bulk").addEventListener("click", () => this.handleBulkImport());

        // Toggles the advanced ingestion module panel.
        document.getElementById("bulk-import-header").addEventListener("click", () => {
            this.bulkImportPanel.classList.toggle("collapsed");
        });
    }

    // ==========================================
    // --- QUIZ FLOW & RENDERING LOGIC ---
    // ==========================================

    /**
     * Synchronizes static UI bounds with the loaded dataset length.
     * 
     * @returns {void} - Does not return a value.
     */
    synchronizeBounds() {
        const totalCount = this.quizState.questionData.length;
        this.totalQuestionsSpan.textContent = totalCount;
        this.maxScoreSpan.textContent = totalCount;
    }

    /**
     * Starts a new quiz session and reveals the active screen.
     * 
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
     * Renders the current question and dynamically generates answer choices.
     * 
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

    // ==========================================
    // --- EVALUATION & STATE MUTATION ---
    // ==========================================

    /**
     * Handles user selection, applies visual feedback, and defers navigation.
     * 
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

    // ==========================================
    // --- TERMINAL STATE & RESETS ---
    // ==========================================

    /**
     * Reveals the results view and updates final performance metrics.
     * 
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
     * Resets screen routing and restarts the quiz session.
     * 
     * @returns {void} - Does not return a value.
     */
    restartQuiz() {
        this.resultScreen.classList.remove("active");
        this.startQuiz();
    }

    // ==========================================
    // --- BUILDER UI & DOM INJECTION ---
    // ==========================================

    /**
     * Initializes the creator environment, clearing previous states and injecting a foundational card.
     * 
     * @returns {void} - Does not return a value.
     */
    initializeBuilder() {
        // Clears any previous session data to ensure a pristine building environment.
        this.builderContainer.innerHTML = "";
        
        // Injects a foundational empty question block to guide the user.
        this.addBuilderQuestionCard();
    }

    /**
     * Constructs and injects a new interactive question block into the Builder DOM.
     * 
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
                <span class="toggle-icon">▼</span>
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

        const addBtn = card.querySelector(".btn-add-distractor");
        const dContainer = card.querySelector(".distractors-container");
        const cardHeader = card.querySelector(".card-header");
        const qInput = card.querySelector(".q-input");
        const cardTitle = card.querySelector(".card-title");

        /* Binds local DOM events to govern card collapsibility, live text updates, and distractor limitations. */
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
     * Intercepts raw text, delegates logic parsing to the Builder State, and renders the UI changes.
     * 
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
            // Delegates the pure logic evaluation to the State/Model class.
            const parsedData = QuizBuilderState.parseBulkPayload(rawText);

            if (!parsedData || parsedData.length === 0) {
                throw new Error("No valid QAD or JSON questions detected.");
            }

            this.builderContainer.innerHTML = "";
            parsedData.forEach(q => this.addBuilderQuestionCard(q));
            this.bulkImportText.value = "";
            
        } catch (error) {
            console.error("Bulk parsing failed:", error);
            this.bulkImportStatus.textContent = `Error: ${error.message}`;
            this.bulkImportStatus.classList.add("error", "visible");
        }
    }

    /**
     * Scrapes the Builder DOM to serialize the visual form into a valid schema.
     * 
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
     * Extracts the view data and delegates the file generation to the export utility.
     * 
     * @returns {void} - Does not return a value.
     */
    exportBuilderQuiz() {
        // Scrapes the physical view for the current state.
        const payload = this.serializeBuilderForm();
        
        // Delegates the OS download action to the stateless utility class.
        FileExportUtil.downloadAsJSON(payload, "custom_quizset.json");
    }
}