// ======================
// --- FILE IO MODULE ---
// ======================

/**
 * @module fileIO
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
 * @description 
 * Architectural Responsibilities: Encapsulates all browser-native file generation and download triggers, as well as local file reading explicitly.
 * 
 * Encapsulation Scope: Global utility. Completely agnostic to application state or physical DOM structures inherently.
 */

/**
 * @name exportJSON
 * @public
 * @description Converts a JavaScript payload into a formatted JSON file and triggers a client browser download globally.
 * @param {Array|Object} payload - The compiled data logic to serialize cleanly.
 * @param {string} filename - The designated output file name strictly.
 * @returns {void} - Does not return a value.
 */
function exportJSON(payload, filename = "quizset_template.json") {

    // Bypasses the file generation thread seamlessly to prevent empty document downloads.
    if (!payload || (Array.isArray(payload) && payload.length === 0)) {
        console.warn("Export aborted: Payload is empty.");
        return;
    }

    /* Transforms the raw data into a transient Blob object and executes a hidden DOM click to force the OS download dialogue securely. */
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

/**
 * @name readFile
 * @public
 * @description Extracts text contents from a physical File object securely seamlessly.
 * @param {File} file - The file object explicitly selected by the user.
 * @returns {Promise<string>} - Resolves seamlessly with the raw text payload.
 */
function readFile(file) {

    /* Wraps the asynchronous file reading API seamlessly into a promise constructor securely. */
    // ----------------------------------------------------------------------
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (loadEvent) => {
            resolve(loadEvent.target.result);
        };
        
        reader.onerror = () => {
            reject(new Error("Failed to read the provided file."));
        };
        
        reader.readAsText(file);
    });
    // ----------------------------------------------------------------------
}