/**
 * @class QuizBuilderState
 * @name QuizBuilderState
 * @description 
 * Architectural Responsibilities: Encapsulates the business logic for dynamic quiz generation. 
 * Evaluates raw text payloads to determine schema formatting and routes digestion to the 
 * appropriate parsing engine.
 * 
 * Encapsulation Scope: Strictly isolated to data transformation. It purely receives strings 
 * and returns validated array structures. It does not interact with the UI layer.
 */
class QuizBuilderState {

    /**
     * @name parseBulkPayload
     * @description Evaluates raw input strings to determine structural formatting and extracts assessment data.
     * @param {string} rawText - The raw string payload pasted by the user.
     * @returns {Array<Object>} - The fully parsed and formatted assessment dataset.
     */
    static parseBulkPayload(rawText) {
        
        // Sanitizes the raw input to prevent whitespace-triggered parsing errors.
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
}