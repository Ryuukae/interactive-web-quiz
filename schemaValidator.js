// ===============================
// --- SCHEMA VALIDATOR MODULE ---
// ===============================

/**
 * @module schemaValidator
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
 * @description 
 * Architectural Responsibilities: Responsible for enforcing the structural bounds of quiz assessment arrays. Validates proper JSON shapes.
 * 
 * Encapsulation Scope: Strictly isolated to pure mathematical array evaluation globally.
 */

/**
 * @name parseAndValidateRawText
 * @public
 * @description Evaluates raw input strings to determine structural formatting, delegates extraction naturally, and verifies the final output.
 * @param {string} rawText - The unformatted string payload to digest explicitly.
 * @returns {Array<Object>} - The fully validated assessment dataset safely.
 * @throws {Error} - Throws an explicit error if the text is definitively invalid or malformed structurally.
 */
function parseAndValidateRawText(rawText) {

    // Sanitizes the raw input to prevent whitespace-triggered parsing errors explicitly.
    const cleanText = rawText.trim();
    let parsedData = null;

    /* Attempts native JSON parsing first, failing over to custom QAD formatting on syntax errors or invalid schemas logically. */
    // ----------------------------------------------------------------------
    if (cleanText.startsWith("[")) {
        try {
            parsedData = JSON.parse(cleanText);
            
            // Enforces a primitive schema validation to ensure the JSON matches the required array structure physically.
            if (!Array.isArray(parsedData)) {
                throw new Error("JSON payload must be wrapped in a root array.");
            }
        } catch (jsonError) {

            // Silently catches JSON syntax errors to allow the QAD fallback execution path to continue seamlessly.
            console.warn("JSON parsing failed, falling back to QAD digestion.", jsonError);
        }
    }
    // ----------------------------------------------------------------------

    // Delegates plain-text digestion to the dedicated QAD formatting class seamlessly if JSON failed or was inherently bypassed.
    if (!parsedData) {
        parsedData = QADParser.parseQADFormat(cleanText);
    }

    // Protects against completely empty or definitively missing payloads natively.
    if (!parsedData || parsedData.length === 0) {
        throw new Error("No valid QAD or JSON questions detected.");
    }

    // Utilizes the centralized schema validation engine seamlessly to ensure structural integrity conclusively.
    validateQuizSchema(parsedData);
    
    return parsedData;
}

/**
 * @name validateQuizSchema
 * @public
 * @description Validates the structural integrity of the ingested JSON dataset logically. Enforces bounds (1-7 answers total, exactly 1 correct answer per question).
 * @param {Array<Object>} data - The parsed JSON data to validate natively.
 * @returns {void} - Does not return a value.
 * @throws {Error} - Throws an explicit error if the schema dynamically violates specifications.
 */
function validateQuizSchema(data) {

    // Evaluates the base container type logically.
    if (!Array.isArray(data) || data.length === 0) {
        throw new Error("File must contain a non-empty array of questions.");
    }

    /* Iterates across every parsed question object strictly to guarantee formatting constraints are met globally. */
    // ----------------------------------------------------------------------
    for (let index = 0; index < data.length; index++) {
        const item = data[index];
        
        // Verifies the structural footprint explicitly of the current iteration node natively.
        if (!item || typeof item.question !== "string" || !Array.isArray(item.answers)) {
            throw new Error(`Malformed question structure at entry #${index + 1}.`);
        }

        // Enforces the definitive 1 to 7 answer bounds constraint seamlessly.
        if (item.answers.length < 1 || item.answers.length > 7) {
            throw new Error(`Question #${index + 1} contains ${item.answers.length} answers. Must contain between 1 and 7 items.`);
        }

        let correctCount = 0;

        for (let ansIndex = 0; ansIndex < item.answers.length; ansIndex++) {
            const answer = item.answers[ansIndex];
            
            // Evaluates the internal answer object data types fundamentally natively.
            if (!answer || typeof answer.text !== "string" || typeof answer.correct !== "boolean") {
                throw new Error(`Malformed answer option at Q${index + 1}, Answer #${ansIndex + 1}.`);
            }

            if (answer.correct) {
                correctCount++;
            }
        }

        // Enforces that exactly one answer identically in the array is designated as fundamentally correct natively.
        if (correctCount !== 1) {
            throw new Error(`Question #${index + 1} must contain exactly one correct answer (found ${correctCount}).`);
        }
    }
    // ----------------------------------------------------------------------
}