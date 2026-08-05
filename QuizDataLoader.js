/**
 * @class QuizDataLoader
 * @description Encapsulates the client-side file reading architecture. 
 * Responsible for intercepting local file uploads, parsing JSON payloads into memory via the native FileReader API, 
 * and handling synchronous UI state updates to reflect file validation status.
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

        // Guard clause: Terminates execution immediately if the user cancels the OS file dialog, 
        // preventing null reference exceptions down the pipeline.
        if (!file) return;
        
        // --- UI STATE UPDATE ---
        // Injects the extracted filename into the DOM and triggers the CSS opacity transition
        this.file_status.textContent = file.name;
        this.file_status.classList.add("visible");

        // --- ASYNCHRONOUS FILE PARSING ---
        // Instantiate the browser's native FileReader to handle local memory buffer reading
        const reader = new FileReader();

        // Establish the callback fired when the I/O read operation resolves successfully
        reader.onload = (loadEvent) => {
            try {
                // Extract the raw text buffer from the resolved event target
                const rawText = loadEvent.target.result;
                
                // Attempt to parse the raw string into a structured JavaScript object.
                // This is a volatile operation that will throw a SyntaxError if the JSON is malformed.
                this.customData = JSON.parse(rawText);
                
                console.log("Custom JSON successfully parsed and hydrated into memory.", this.customData);
            } catch (error) {
                // Intercepts parsing errors to gracefully degrade rather than crashing the application thread.
                console.error("QuizDataLoader Error - Failed to parse payload:", error);
                
                // Provides immediate, localized visual error feedback to the user
                this.file_status.textContent = "Error: Invalid JSON format";
                
                // Strictly resets the payload state to prevent the execution of corrupted data
                this.customData = null; 
            }
        };

        // Executes the file reading operation, instructing the API to decode the buffer as UTF-8 text.
        // This is non-blocking; the onload callback resolves once this thread completes.
        reader.readAsText(file);
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