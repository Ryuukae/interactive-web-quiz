/**
 * @class QuizDataLoader
 * @name QuizDataLoader
 * @description 
 * Architectural Responsibilities: Encapsulates the client-side file reading architecture. 
 * Responsible for intercepting local file uploads, parsing JSON payloads into memory via the native FileReader API, 
 * validating structural schema integrity, and handling synchronous UI state updates to reflect validation status.
 * 
 * Encapsulation Scope: Provides data parsing and schema validation rules across the application.
 */
class QuizDataLoader {
    
    // ======================
    // --- INITIALIZATION ---
    // ======================

    /**
     * @name constructor
     * @description Initializes the DataLoader and binds necessary DOM nodes.
     * @param {HTMLElement} input_element - The hidden native file input node.
     * @param {HTMLElement} file_status - The span node designated for file name output.
     * @returns {void} - Does not return a value.
     */
    constructor(input_element, file_status) {
        // Cache DOM references to prevent repeated document queries during execution
        this.input_element = input_element;
        this.file_status = file_status;
        
        // Initializes the internal state payload strictly to null prior to successful hydration
        this.customData = null; 

        // Automatically establish event listeners upon instantiation
        this.bindEvents();
    }

    // ========================
    // --- EVENT DELEGATION ---
    // ========================

    /**
     * @name bindEvents
     * @description Establishes the event delegation for the file input node.
     * @returns {void} - Does not return a value.
     */
    bindEvents() {
        // Binds the 'change' event to trigger file processing.
        // Utilizes an arrow function to preserve lexical scoping, ensuring 'this' 
        // strictly references the QuizDataLoader instance, not the DOM element.
        this.input_element.addEventListener("change", (event) => this.processFile(event));
    }

    // =============================
    // --- FILE PROCESSING LOGIC ---
    // =============================

    /**
     * @name processFile
     * @description Primary execution thread for file extraction, validation, and asynchronous parsing.
     * @param {Event} event - The standard DOM change event object.
     * @returns {void} - Does not return a value.
     */
    processFile(event) {
        // Extract the physical File object from the event's FileList array
        const file = event.target.files[0];

        // Guard clause: Terminates execution immediately if the user cancels the OS file dialog
        if (!file) return;
        
        // Target the primary CTA button to manage its interaction lock
        const startBtn = document.getElementById("start-btn");
        if (startBtn) startBtn.disabled = true; // Explicitly lock during analysis
        
        // --- UI STATE UPDATE ---
        // Strip out any previous status classes to ensure a clean repaint
        this.file_status.classList.remove("error", "success");
        this.file_status.textContent = `Analyzing ${file.name}...`;
        this.file_status.classList.add("visible");

        const fileExtension = file.name.split('.').pop().toLowerCase();
        const reader = new FileReader();

        reader.onload = (loadEvent) => {
            try {
                const rawText = loadEvent.target.result;
                let parsedData;
                
                /* Executes format-specific parsing routines based on file extension. */
                if (fileExtension === 'txt') {
                    parsedData = QADParser.parseQADFormat(rawText);
                } else if (fileExtension === 'json') {
                    parsedData = JSON.parse(rawText);
                } else {
                    throw new Error("Unsupported file format. Please upload a .txt or .json file.");
                }
                
                // Explicitly validate the dataset schema
                QuizDataLoader.validateSchema(parsedData);
                
                // Hydrate internal memory once syntax and schema are both verified
                this.customData = parsedData;
                
                // Provide positive visual feedback utilizing the new success hook
                this.file_status.textContent = `${file.name} (Ready)`;
                this.file_status.classList.add("success");
                
                // --- UNLOCK APPLICATION ---
                // Permits the user to begin the assessment now that a valid payload is ready
                if (startBtn) startBtn.disabled = false; 
                
                console.log("Custom Quizset successfully parsed and hydrated into memory.", this.customData);
            } catch (error) {
                console.error("QuizDataLoader Error - Failed to parse payload:", error);
                
                // --- UI STATE UPDATE (ERROR) ---
                this.file_status.classList.remove("success");
                this.file_status.classList.add("error");
                this.file_status.textContent = `Error: ${error.message || "Invalid format"}`;
                
                // Strictly resets the payload state to prevent the execution of corrupted data
                this.customData = null; 
                
                // Note: The start button intentionally remains locked in this catch block
            }
        };

        reader.readAsText(file);
    }

    /**
     * @name processRawText
     * @description Processes raw text strings directly, bypassing the FileReader I/O layer.
     * @param {string} rawText - The unformatted string payload to digest.
     * @returns {Array<Object>} - The fully validated assessment dataset.
     * @throws {Error} Throws an explicit error if the text is invalid or malformed.
     */
    static processRawText(rawText) {
        // Delegates the pure logic evaluation to the State/Model class.
        const parsedData = QuizBuilderState.parseBulkPayload(rawText);

        if (!parsedData || parsedData.length === 0) {
            throw new Error("No valid QAD or JSON questions detected.");
        }

        // Utilizes the centralized schema validation engine to ensure structural integrity.
        QuizDataLoader.validateSchema(parsedData);
        
        return parsedData;
    }

    // =========================
    // --- SCHEMA VALIDATION ---
    // =========================

    /**
     * @name validateSchema
     * @description Validates the structural integrity of the ingested JSON dataset. Enforces bounds (1-7 answers total, exactly 1 correct answer per question).
     * @param {Array<Object>} data - The parsed JSON data to validate.
     * @returns {void} - Does not return a value.
     * @throws {Error} Throws an explicit error if the schema does not match specifications.
     */
    static validateSchema(data) {
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("File must contain a non-empty array of questions.");
        }

        for (let index = 0; index < data.length; index++) {
            const item = data[index];
            
            if (!item || typeof item.question !== "string" || !Array.isArray(item.answers)) {
                throw new Error(`Malformed question structure at entry #${index + 1}.`);
            }

            // Enforces the 1 to 7 answer bounds constraint.
            if (item.answers.length < 1 || item.answers.length > 7) {
                throw new Error(`Question #${index + 1} contains ${item.answers.length} answers. Must contain between 1 and 7 items.`);
            }

            let correctCount = 0;

            for (let ansIndex = 0; ansIndex < item.answers.length; ansIndex++) {
                const answer = item.answers[ansIndex];
                
                if (!answer || typeof answer.text !== "string" || typeof answer.correct !== "boolean") {
                    throw new Error(`Malformed answer option at Q${index + 1}, Answer #${ansIndex + 1}.`);
                }

                if (answer.correct) {
                    correctCount++;
                }
            }

            // Enforces that exactly one answer in the array is designated as correct.
            if (correctCount !== 1) {
                throw new Error(`Question #${index + 1} must contain exactly one correct answer (found ${correctCount}).`);
            }
        }
    }
    
    // =======================
    // --- STATE ACCESSORS ---
    // =======================

    /**
     * @name getCustomData
     * @description Accessor method for the hydrated JSON payload.
     * @returns {Array<Object>|null} The validated question dataset or null if uninitialized/failed.
     */
    getCustomData() {
        return this.customData;
    }
}