/**
 * @class QuizDataLoader
 * @description Encapsulates the client-side file reading architecture. 
 * Responsible for intercepting local file uploads, parsing JSON payloads into memory via the native FileReader API, 
 * validating structural schema integrity, and handling synchronous UI state updates to reflect validation status.
 */
class QuizDataLoader {
    
    // ==========================================
    // --- INITIALIZATION                     ---
    // ==========================================

    /**
     * Initializes the DataLoader and binds necessary DOM nodes.
     * @param {HTMLElement} input_element - The hidden native file input node.
     * @param {HTMLElement} file_status - The span node designated for file name output.
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

    // ==========================================
    // --- EVENT DELEGATION                   ---
    // ==========================================

    /**
     * Establishes the event delegation for the file input node.
     */
    bindEvents() {
        // Binds the 'change' event to trigger file processing.
        // Utilizes an arrow function to preserve lexical scoping, ensuring 'this' 
        // strictly references the QuizDataLoader instance, not the DOM element.
        this.input_element.addEventListener("change", (event) => this.processFile(event));
    }

    // ==========================================
    // --- FILE PROCESSING LOGIC              ---
    // ==========================================

    /**
     * Primary execution thread for file extraction, validation, and asynchronous parsing.
     * @param {Event} event - The standard DOM change event object.
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
        this.file_status.classList.remove("error");
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
                this.validateSchema(parsedData);
                
                // Hydrate internal memory once syntax and schema are both verified
                this.customData = parsedData;
                
                // Provide positive visual feedback
                this.file_status.textContent = `${file.name} (Ready)`;
                
                // --- UNLOCK APPLICATION ---
                // Permits the user to begin the assessment now that a valid payload is ready
                if (startBtn) startBtn.disabled = false; 
                
                console.log("Custom Quizset successfully parsed and hydrated into memory.", this.customData);
            } catch (error) {
                console.error("QuizDataLoader Error - Failed to parse payload:", error);
                
                // --- UI STATE UPDATE (ERROR) ---
                this.file_status.classList.add("error");
                this.file_status.textContent = `Error: ${error.message || "Invalid format"}`;
                
                // Strictly resets the payload state to prevent the execution of corrupted data
                this.customData = null; 
                
                // Note: The start button intentionally remains locked in this catch block
            }
        };

        reader.readAsText(file);
    }

    // ==========================================
    // --- SCHEMA VALIDATION                  ---
    // ==========================================

    /**
     * Validates the structural integrity of the ingested JSON dataset.
     * Ensures the dataset is a non-empty array containing properly formatted question and answer objects.
     * 
     * @param {Array<Object>} data - The parsed JSON data to validate.
     * @throws {Error} Throws an explicit error if the schema does not match specifications.
     */
    validateSchema(data) {
        // Enforce root type and non-empty bounds
        if (!Array.isArray(data) || data.length === 0) {
            throw new Error("File must contain a non-empty array of questions.");
        }

        // Iterate through each question object to inspect internal properties
        for (let index = 0; index < data.length; index++) {
            const item = data[index];
            
            // Validate the parent question node
            if (!item || typeof item.question !== "string" || !Array.isArray(item.answers) || item.answers.length === 0) {
                throw new Error(`Malformed question structure at entry #${index + 1}.`);
            }

            // Validate nested answer objects
            for (let ansIndex = 0; ansIndex < item.answers.length; ansIndex++) {
                const answer = item.answers[ansIndex];
                
                // Ensure strictly typed properties required by the DOM rendering and scoring logic
                if (!answer || typeof answer.text !== "string" || typeof answer.correct !== "boolean") {
                    throw new Error(`Malformed answer option at Q${index + 1}, Answer #${ansIndex + 1}.`);
                }
            }
        }
    }
    
    // ==========================================
    // --- STATE ACCESSORS                    ---
    // ==========================================

    /**
     * Accessor method for the hydrated JSON payload.
     * @returns {Array<Object>|null} The validated question dataset or null if uninitialized/failed.
     */
    getCustomData() {
        return this.customData;
    }
}