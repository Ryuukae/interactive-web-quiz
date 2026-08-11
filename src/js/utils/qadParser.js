import { createLogger } from "./logger.js";

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
    const logger = createLogger("qadParser.parseQADFormat");
    logger.info("parseQADFormat called", {
        rawText,
        characterCount: rawText ? rawText.length : 0
    });

    const normalizedText = rawText.replace(/\r\n/g, "\n").trim();
    const lines = normalizedText.split("\n");
    logger.debug("Normalized raw text into lines", { lineCount: lines.length });

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
                logger.debug("Finalizing previous question block", {
                    question: currentQuestion.question
                });
                validateBlock(currentQuestion, answerCount, distractorCount);
                questions.push(currentQuestion);
            }

            currentQuestion = {
                question: cleanLine.substring(2).trim(),
                answers: []
            };
            logger.debug("Parsed question header", {
                question: currentQuestion.question
            });

            answerCount = 0;
            distractorCount = 0;
        } else if (lowerLine.startsWith("a=")) {
            if (currentQuestion === null) {
                logger.error("QAD parse error: Orphaned answer detected");
                throw new Error(
                    "Orphaned answer detected. Every block must start with 'q='."
                );
            }

            if (answerCount >= 1) {
                logger.error(
                    "QAD parse error: Multiple correct answers detected in block",
                    { question: currentQuestion.question }
                );
                throw new Error(
                    "Malformed block: Each question group can only have exactly one 'a=' line."
                );
            }

            const aText = cleanLine.substring(2).trim();
            if (!aText) {
                logger.error("QAD parse error: Empty correct answer text");
                throw new Error(
                    `Correct answer line 'a=' for question "${currentQuestion.question || "unnamed"}" cannot be empty or whitespace-only.`
                );
            }

            currentQuestion.answers.push({
                text: aText,
                correct: true
            });
            answerCount++;
            logger.trace("Parsed correct answer", {
                question: currentQuestion.question,
                answerCount
            });
        } else if (lowerLine.startsWith("d=")) {
            if (currentQuestion === null) {
                logger.error("QAD parse error: Orphaned distractor detected");
                throw new Error(
                    "Orphaned distractor detected. Every block must start with 'q='."
                );
            }

            const dText = cleanLine.substring(2).trim();
            if (!dText) {
                logger.error("QAD parse error: Empty distractor text");
                throw new Error(
                    `Distractor line 'd=' for question "${currentQuestion.question || "unnamed"}" cannot be empty or whitespace-only.`
                );
            }

            currentQuestion.answers.push({
                text: dText,
                correct: false
            });
            distractorCount++;
            logger.trace("Parsed distractor", {
                question: currentQuestion.question,
                distractorCount
            });
        }
    }
    // ----------------------------------------------------------------------

    if (currentQuestion !== null) {
        logger.debug("Finalizing trailing question block", {
            question: currentQuestion.question
        });
        validateBlock(currentQuestion, answerCount, distractorCount);
        questions.push(currentQuestion);
    }

    if (questions.length === 0) {
        logger.error("QAD parse error: No question blocks found");
        throw new Error("No valid question blocks detected.");
    }

    logger.info("QAD parsing completed successfully", {
        questionCount: questions.length
    });
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
    const logger = createLogger("qadParser.validateBlock");
    logger.info("validateBlock called", { block, answers, distractors });

    if (!block.question) {
        logger.error("validateBlock error: Missing question text", { block });
        throw new Error("Question block is missing prompt text.");
    }
    if (answers !== 1) {
        logger.error("validateBlock error: Invalid correct answer count", {
            answers,
            question: block.question
        });
        throw new Error(
            `Question "${block.question}" must have exactly one 'a=' correct answer line.`
        );
    }
    if (distractors < 1 || distractors > 6) {
        logger.error("validateBlock error: Distractor count out of bounds", {
            distractors,
            question: block.question
        });
        throw new Error(
            `Question "${block.question}" must have between 1 and 6 'd=' distractor lines (found ${distractors}).`
        );
    }

    logger.debug("Validated QAD block successfully", {
        question: block.question,
        answers,
        distractors
    });
}
