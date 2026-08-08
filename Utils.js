// ===========================
// --- FILE EXPORT UTILITY ---
// ===========================

/**
 * @class FileExportUtil
 * @name FileExportUtil
 * @description Architectural Responsibilities: Encapsulates all browser-native file generation and download triggers.
 * Encapsulation Scope: Global utility. Completely agnostic to application state or DOM structure.
 */
class FileExportUtil {
    
    /**
     * @name downloadAsJSON
     * @description Converts a JavaScript payload into a formatted JSON file and triggers a client browser download.
     * @param {Array|Object} payload - The compiled data to serialize.
     * @param {string} filename - The designated output file name.
     * @returns {void} - Does not return a value.
     */
    static downloadAsJSON(payload, filename = "quizset_template.json") {
        
        // Bypasses the file generation thread to prevent empty document downloads.
        if (!payload || (Array.isArray(payload) && payload.length === 0)) {
            console.warn("Export aborted: Payload is empty.");
            return;
        }

        /* Transforms the raw data into a transient Blob object and executes a hidden DOM click to force the OS download dialogue. */
        // ----------------------------------------------------------------------
        const jsonString = JSON.stringify(payload, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        
        document.body.appendChild(anchor);
        anchor.click();
        
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url);
        // ----------------------------------------------------------------------
    }
}

// ========================
// --- TEMPLATE UTILITY ---
// ========================

/**
 * @class TemplateUtil
 * @name TemplateUtil
 * @description Architectural Responsibilities: Houses static string payloads for injection into user-facing text areas to assist with syntax formatting.
 * Encapsulation Scope: Global utility. Provides read-only data string generation.
 */
class TemplateUtil {
    
    /**
     * @name getJsonTemplate
     * @description Generates a structural JSON template payload.
     * @returns {string} - The formatted JSON blueprint.
     */
    static getJsonTemplate() {
        return `[\n  {\n    "question": "Your question here?",\n    "answers": [\n      { "text": "Correct option", "correct": true },\n      { "text": "Wrong option", "correct": false }\n    ]\n  }\n]`;
    }

    /**
     * @name getTxtTemplate
     * @description Generates a structural plain-text QAD template payload.
     * @returns {string} - The formatted TXT blueprint.
     */
    static getTxtTemplate() {
        return `q=Your question here?\na=Correct option\nd=Wrong option\nd=Another wrong option`;
    }
}

// ======================
// --- PROMPT UTILITY ---
// ======================

/**
 * @class PromptUtil
 * @name PromptUtil
 * @description Architectural Responsibilities: Encapsulates user confirmation interactions, providing a unified interface for protective warnings before destructive actions.
 * Encapsulation Scope: Global utility. Wraps native browser dialogs to allow for future scalability without refactoring the application layer.
 */
class PromptUtil {
    
    /**
     * @name confirmAction
     * @description Halts the execution thread to ask the user for confirmation.
     * @param {string} message - The custom warning text to display.
     * @returns {boolean} - True if the user confirms, false if they cancel.
     */
    static confirmAction(message) {
        return window.confirm(message);
    }
}