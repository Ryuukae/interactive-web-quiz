// ==========================================
// --- QAD PARSER CLASS ---
// ==========================================

/**
 * QADParser
 * 
 * Architectural Responsibilities: Responsible for ingesting raw QAD formatted 
 * text strings, normalizing line endings, and executing parsing loops to assemble 
 * valid question objects. Acts as a strict translation layer between human-readable 
 * text files and the application's required JSON state structure.
 * 
 * Encapsulation Scope: Strictly isolated to data formatting. It does not interact 
 * with the DOM, nor does it mutate the global QuizState directly. It purely receives 
 * a string and returns a formatted array.
 */
class QADParser {

    /**
     * Parses custom QAD text files into a standardized JSON array for the application.
     * 
     * Normalizes line endings across different operating systems, iterates through 
     * the payload to isolate question blocks, and constructs state-ready objects.
     *
     * @param {string} rawText - The raw text payload from the uploaded file.
     * @returns {Array} - Formatted question objects ready for state ingestion.
     */
    static parseQADFormat(rawText) {

        // Normalizes line endings globally to ensure predictable array splitting.
        const normalizedText = rawText.replace(/\r\n/g, '\n').trim();
        const quizsetData = normalizedText.split('\n');

        const questions = [];
        let currentQuestion = null;

        /* Iterates sequentially through the text lines to assemble discrete question objects based on prefix markers. */
        // ----------------------------------------------------------------------
        for (let line of quizsetData) {
            
            // Strips leading and trailing whitespace to prevent invisible character bugs.
            const cleanLine = line.trim();
            
            // Bypasses completely empty lines to allow users to format with generous vertical spacing.
            if (!cleanLine) {
                continue;
            }
        
            // Identifies a new question block and initializes the required object architecture.
            if (cleanLine.toLowerCase().startsWith("q=")) {
                
                // Pushes the previously assembled question into the main array before initializing a new memory block.
                if (currentQuestion !== null) {
                    questions.push(currentQuestion);
                }
                
                // Reassigns currentQuestion to a brand new object containing the question text and an empty answers array.
                currentQuestion = {
                    question: cleanLine.substring(2).trim(),
                    answers: []
                };
            }

            // Identifies an answer or distractor line and appends it to the active question block.
            if (cleanLine.toLowerCase().startsWith("a=") || cleanLine.toLowerCase().startsWith("d=")) {
                
                // Safeguards against orphaned answers if a user forgets to start with a Q line.
                if (currentQuestion !== null) {
                    
                    // Evaluates the prefix to strictly assign the boolean correct state.
                    const isCorrect = cleanLine.toLowerCase().startsWith("a=");
                    
                    currentQuestion.answers.push({
                        text: cleanLine.substring(2).trim(),
                        correct: isCorrect
                    });
                }
            }
        }
        // ----------------------------------------------------------------------

        // Captures the final question block in the file since the iteration loop will terminate before it is pushed.
        if (currentQuestion !== null) {
            questions.push(currentQuestion);
        }

        return questions;
    }
}