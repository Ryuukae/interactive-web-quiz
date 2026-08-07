// ==========================================
// --- QUIZ CREATOR CLASS ---
// ==========================================

/**
 * QuizCreator
 * 
 * Architectural Responsibilities: Manages the state and DOM rendering for the native quiz builder interface. 
 * Handles the dynamic injection of input fields, parses bulk QAD text into the visual form, and serializes 
 * the final layout into a downloadable JSON payload.
 * 
 * Encapsulation Scope: Operates strictly within the #creator-screen DOM node. 
 * Does not mutate the global QuizState or interfere with active assessment sessions.
 */
class QuizCreator {

    /**
     * Initializes the creator environment and binds static event listeners.
     * 
     * Establishes the baseline UI state by injecting an initial empty question block 
     * and linking the core export/import interaction nodes.
     *
     * @returns {void}
     */
    static initialize() {

        // Clears any previous session data to ensure a pristine building environment.
        document.getElementById("builder-questions-container").innerHTML = "";
        
        // Injects a foundational empty question block to guide the user.
        this.addQuestionCard();

        // Prevents redundant event listener bindings on subsequent initializations.
        if (!this.isInitialized) {
            document.getElementById("btn-add-question").addEventListener("click", () => this.addQuestionCard());
            document.getElementById("btn-export-quiz").addEventListener("click", () => this.exportToJSON());
            document.getElementById("btn-parse-bulk").addEventListener("click", () => this.handleBulkImport());
            this.isInitialized = true;
        }
    }

    /**
     * Constructs and injects a new interactive question block into the DOM.
     * 
     * Assembles the structured input groups within a collapsible container architecture. 
     * Enforces a maximum payload of 6 distractors and binds live-updating header text for spatial efficiency.
     *
     * @param {Object} prefillData - Optional data payload for populating the inputs during a bulk import.
     * @returns {void}
     */
    static addQuestionCard(prefillData = null) {
        const container = document.getElementById("builder-questions-container");
        const card = document.createElement("div");
        card.className = "glass-panel question-card";

        const questionVal = prefillData ? prefillData.question : "";
        let correctVal = "";
        
        // Establishes a strict baseline of exactly one empty distractor for a new block.
        let distractorVals = [""];

        /* Extracts answer strings from the prefill payload to map them to the correct input tiers. */
        // ----------------------------------------------------------------------
        if (prefillData && prefillData.answers) {
            const correctAns = prefillData.answers.find(a => a.correct);
            if (correctAns) correctVal = correctAns.text;

            const distractors = prefillData.answers.filter(a => !a.correct);
            if (distractors.length > 0) {
                // Truncates the incoming prefill data at 6 distractors to prevent schema overflow.
                distractorVals = distractors.map(d => d.text).slice(0, 6);
            }
        }
        // ----------------------------------------------------------------------

        // Determines the initial header text, falling back to a default label if no prefill data exists.
        const headerTitle = questionVal ? questionVal : "New Question...";

        // Injects the enhanced HTML structure utilizing explicit accessibility labels, input groups, and a collapsible structural wrapper.
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
                    
                    <button class="secondary-btn btn-add-distractor" style="display: block; margin-left: auto; margin-top: 12px; font-size: 0.75rem; padding: 6px 12px;">+ Add Distractor</button>
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
        // Evaluates initial load state to immediately restrict addition if the prefill hit the ceiling.
        if (distractorVals.length >= 6) {
            addBtn.style.display = "none";
        }

        // Toggles the collapsed state class on the parent card node to optimize vertical rendering space.
        cardHeader.addEventListener("click", () => {
            card.classList.toggle("collapsed");
        });

        // Mirrors the question input value directly to the card header to ensure the collapsed state remains identifiable.
        qInput.addEventListener("input", (e) => {
            cardTitle.textContent = e.target.value || "New Question...";
        });

        // Binds the localized addition event strictly to the current card context.
        addBtn.addEventListener("click", () => {
            const currentCount = dContainer.querySelectorAll(".d-input").length;

            // Evaluates the current active DOM nodes to enforce the hard 6-distractor limit.
            if (currentCount < 6) {
                const input = document.createElement("input");
                input.type = "text";
                input.className = "glass-input d-input";
                input.placeholder = "e.g., 8080";
                dContainer.appendChild(input);

                // Dynamically hides the interaction trigger exactly when the ceiling is reached.
                if (currentCount + 1 >= 6) {
                    addBtn.style.display = "none";
                }
            }
        });
        // ----------------------------------------------------------------------

        // Defaults prefilled cards to a collapsed state to immediately conserve viewport space during bulk imports.
        if (prefillData) {
            card.classList.add("collapsed");
        }

        container.appendChild(card);
    }

    /**
     * Intercepts raw text from the advanced input field and routes it through the dynamic format parser.
     * Transforms the raw payload (JSON or QAD) into an array of question objects, validates the 
     * structural integrity, and mirrors them into the visual form while providing localized UI feedback.
     *
     * @returns {void}
     */
    static handleBulkImport() {
        const rawText = document.getElementById("bulk-import-text").value;
        const statusNode = document.getElementById("bulk-import-status");

        // Bypasses execution if the user triggers the import sequence on an empty field.
        if (!rawText.trim()) return;

        // Resets previous error states before initiating a new parsing sequence.
        statusNode.classList.remove("error", "visible");
        statusNode.textContent = "";

        try {
            // Routes the raw string through the dynamic format detection engine.
            const parsedData = this.parseBulkPayload(rawText);

            // Enforces strict validation to ensure the parser actually extracted usable data structures.
            if (!parsedData || parsedData.length === 0) {
                throw new Error("No valid QAD or JSON questions detected.");
            }

            // Purges the container to prevent appending imported data to the default empty block.
            document.getElementById("builder-questions-container").innerHTML = "";

            // Hydrates the visual interface with the newly parsed structural objects.
            parsedData.forEach(q => this.addQuestionCard(q));

            // Provides immediate physical feedback that the ingestion was successful.
            document.getElementById("bulk-import-text").value = "";
            
        } catch (error) {
            console.error("Bulk parsing failed:", error);
            
            // Triggers the localized visual error feedback loop instead of a blocking window alert.
            statusNode.textContent = `Error: ${error.message}`;
            statusNode.classList.add("error", "visible");
        }
    }

    /**
     * Evaluates the raw input string to determine its structural format and routes it to the appropriate parser.
     * Explores the payload for JSON array boundaries. If valid JSON is detected, it utilizes the native browser engine. 
     * Otherwise, it gracefully falls back to the custom QAD text digester.
     *
     * @param {string} rawText - The raw string payload pasted by the user.
     * @returns {Array<Object>} - The fully parsed and formatted assessment dataset.
     * @throws {Error} Throws an explicit error if the payload fails structural validation.
     */
    static parseBulkPayload(rawText) {
        const cleanText = rawText.trim();
        
        /* Attempts native JSON parsing first, failing over to custom QAD formatting on syntax errors or invalid schemas. */
        // ----------------------------------------------------------------------
        if (cleanText.startsWith("[")) {
            try {
                // Attempts to parse the structured payload via the native V8 JSON engine.
                const jsonData = JSON.parse(cleanText);
                
                // Enforces a primitive schema validation to ensure the JSON matches the required array structure.
                if (Array.isArray(jsonData)) {
                    return jsonData;
                }
                
                // Throws an error to exit the JSON try-block if the root structure is an object rather than an array.
                throw new Error("JSON payload must be wrapped in a root array.");
                
            } catch (jsonError) {
                // Silently catches JSON syntax errors to allow the QAD fallback execution path to continue.
                console.warn("JSON parsing failed, falling back to QAD digestion.", jsonError);
            }
        }
        
        // Delegates plain-text digestion to the dedicated QAD formatting class.
        return QADParser.parseQADFormat(cleanText);
        // ----------------------------------------------------------------------
    }

    /**
     * Scrapes the DOM to serialize the visual form state into a valid JSON schema.
     * 
     * Iterates over all mounted question cards, extracts the input values, and constructs 
     * the final structural payload required by the application's ingestion engine.
     *
     * @returns {Array} - The fully compiled assessment dataset.
     */
    static serializeForm() {
        const cards = document.querySelectorAll(".question-card");
        const finalJSON = [];

        /* Iterates through the physical DOM nodes to extract and format user input into application state. */
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
     * Compiles the serialized dataset into a downloadable JSON file.
     * 
     * Instantiates a transient Blob object and utilizes a hidden anchor tag to force 
     * the browser to save the payload to the user's local filesystem.
     *
     * @returns {void}
     */
    static exportToJSON() {
        const data = this.serializeForm();

        // Prevents the generation of an empty file if the user bypassed the input fields.
        if (data.length === 0) {
            alert("Please add at least one question before exporting.");
            return;
        }

        // Encodes the payload with spacing to ensure the resulting file is human-readable.
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "custom_quizset.json";
        
        // Executes the download sequence without requiring physical presence in the DOM layout.
        document.body.appendChild(a);
        a.click();
        
        // Purges the transient URL from memory to prevent memory leaks.
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}