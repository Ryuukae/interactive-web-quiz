import { createLogger } from "./logger.js";

/**
 * @module fileIO
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-08
 * @description
 * Architectural Responsibilities: Encapsulates all browser-native file generation and download triggers, as well as local file reading explicitly.
 *
 * Encapsulation Scope: Global utility. Completely agnostic to application state or physical DOM structures inherently.
 */

/**
 * @name exportJSON
 * @public
 * @description Converts a JavaScript payload into a formatted JSON file and triggers a client browser download globally.
 * @param {Array | object} payload - The compiled data logic to serialize cleanly.
 * @param {string} filename - The designated output file name strictly.
 * @returns {void} - Does not return a value.
 */
export function exportJSON(payload, filename = "quizset_template.json") {
    const logger = createLogger("fileIO.exportJSON");
    logger.info("exportJSON called", { payload, filename });

    if (!payload || (Array.isArray(payload) && payload.length === 0)) {
        logger.warn("Export aborted because payload is empty", { filename });
        return;
    }

    logger.info("Export started", {
        filename,
        itemCount: Array.isArray(payload) ? payload.length : 1
    });

    /* Transforms the raw data into a transient Blob object and executes a hidden DOM click to force the OS download dialogue securely. */
    // ----------------------------------------------------------------------
    const jsonString = JSON.stringify(payload, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;

    logger.debug("Triggering browser download via temporary anchor", {
        filename,
        url
    });
    document.body.appendChild(anchor);
    anchor.click();

    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    // ----------------------------------------------------------------------

    logger.info("Export completed successfully", { filename });
}

/**
 * @name readFile
 * @public
 * @description Extracts text contents from a physical File object securely seamlessly.
 * @param {File} file - The file object explicitly selected by the user.
 * @returns {Promise<string>} - Resolves seamlessly with the raw text payload.
 */
export function readFile(file) {
    const logger = createLogger("fileIO.readFile");
    logger.info("readFile called", {
        file,
        fileName: file ? file.name : null,
        size: file ? file.size : null
    });

    return new Promise((resolve, reject) => {
        logger.debug("readFile: PromiseExecutor initializing FileReader", {
            fileName: file.name
        });
        const reader = new FileReader();

        reader.onload = (loadEvent) => {
            logger.info("readFile: onload completed successfully", {
                fileName: file.name,
                size: file.size,
                bytesLoaded: loadEvent.loaded
            });
            resolve(loadEvent.target.result);
        };

        reader.onerror = () => {
            const error = new Error("Failed to read the provided file.");
            logger.error("readFile: onerror failed reading file", {
                fileName: file.name,
                error
            });
            reject(error);
        };

        logger.debug("readFile: starting readAsText execution", {
            fileName: file.name
        });
        reader.readAsText(file);
    });
}
