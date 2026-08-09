/**
 * @module qadParser
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
 * @description 
 * Architectural Responsibilities: Responsible for ingesting raw QAD formatted text strings, normalizing line endings, and executing parsing loops to assemble valid question objects. Enforces strict schema rules (1 Question, 1 Answer, 1-6 Distractors).
 * 
 * Encapsulation Scope: Strictly isolated to data formatting. It does not interact with the DOM, nor does it mutate global states.
 */

/**
 * @name parseQADFormat
 * @public
 * @description Parses custom QAD text files exclusively into a standardized JSON array optimally for the application natively.
 * @param {string} rawText - The raw text payload string from the optimally uploaded file or physically typed textarea.
 * @returns {Array<Object>} - Formatted question objects sequentially ready for state ingestion globally.
 * @throws {Error} - Throws an explicit string error conclusively if structural formatting bounds are violated natively.
 */
export function parseQADFormat(rawText) {
    const normalizedText = rawText.replace(/\r\n/g, '\n').trim();
    const lines = normalizedText.split('\n');
    
    const questions = [];
    let currentQuestion = null;
    let answerCount = 0;
    let distractorCount = 0;

    /* Iterates sequentially physically through generic text lines exclusively to assemble discrete organically validated question blocks. */
    // ----------------------------------------------------------------------
    for (let line of lines) {
        
        const cleanLine = line.trim();
        
        if (!cleanLine) continue;

        const lowerLine = cleanLine.toLowerCase();

        if (lowerLine.startsWith("q=")) {
            if (currentQuestion !== null) {
                validateBlock(currentQuestion, answerCount, distractorCount);
                questions.push(currentQuestion);
            }

            currentQuestion = {
                question: cleanLine.substring(2).trim(),
                answers: []
            };
            
            answerCount = 0;
            distractorCount = 0;

        } else if (lowerLine.startsWith("a=")) {
            if (currentQuestion === null) {
                throw new Error("Orphaned answer detected. Every block must start with 'q='.");
            }
            
            if (answerCount >= 1) {
                throw new Error("Malformed block: Each question group can only have exactly one 'a=' line.");
            }

            currentQuestion.answers.push({
                text: cleanLine.substring(2).trim(),
                correct: true
            });
            answerCount++;

        } else if (lowerLine.startsWith("d=")) {
            if (currentQuestion === null) {
                throw new Error("Orphaned distractor detected. Every block must start with 'q='.");
            }

            currentQuestion.answers.push({
                text: cleanLine.substring(2).trim(),
                correct: false
            });
            distractorCount++;
        }
    }
    // ----------------------------------------------------------------------

    if (currentQuestion !== null) {
        validateBlock(currentQuestion, answerCount, distractorCount);
        questions.push(currentQuestion);
    }

    if (questions.length === 0) {
        throw new Error("No valid question blocks detected.");
    }

    return questions;
}

/**
 * @name validateBlock
 * @private
 * @description Helper method to validate that a parsed QAD block meets strict structural requirements.
 * @param {Object} block - The question object being assembled.
 * @param {number} answers - Count of correct answers found.
 * @param {number} distractors - Count of distractors found.
 * @returns {void} - Does not return a value.
 * @throws {Error} - Throws an explicit error if counts fall outside acceptable parameters.
 */
function validateBlock(block, answers, distractors) {
    if (!block.question) {
        throw new Error("Question block is missing prompt text.");
    }
    if (answers !== 1) {
        throw new Error(`Question "${block.question}" must have exactly one 'a=' correct answer line.`);
    }
    if (distractors < 1 || distractors > 6) {
        throw new Error(`Question "${block.question}" must have between 1 and 6 'd=' distractor lines (found ${distractors}).`);
    }
}

