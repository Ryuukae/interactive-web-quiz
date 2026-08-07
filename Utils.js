// ==========================================
// --- FILE EXPORT UTILITY ---
// ==========================================

/**
 * FileExportUtil
 * 
 * Architectural Responsibilities: Encapsulates all browser-native file generation 
 * and download triggers. 
 * 
 * Encapsulation Scope: Global utility. Completely agnostic to application state or DOM structure.
 */
class FileExportUtil {
    
    /**
     * Converts a JavaScript payload into a formatted JSON file and triggers a client browser download.
     * 
     * @param {Array|Object} payload - The compiled data to serialize.
     * @param {string} filename - The designated output file name.
     * @returns {void}
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