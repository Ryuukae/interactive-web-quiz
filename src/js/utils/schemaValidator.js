import { parseQADFormat } from "./qadParser.js";
import { createLogger } from "./logger.js";

const logger = createLogger("schemaValidator");

/**
 * Architectural Responsibilities: Responsible for enforcing the structural bounds of quiz assessment arrays. Validates proper JSON shapes.
 * Encapsulation Scope: Strictly isolated to pure mathematical array evaluation globally.
 * @module schemaValidator
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 */

/**
 * Provides internal functionality.
 * @typedef {import('../models/QuizState.js').QuestionType} QuestionType
 */

/**
 * Evaluates raw input strings to determine structural formatting, delegates extraction naturally, and verifies the final output.
 * @name parseAndValidateRawText
 * @public
 * @param {string} rawText - The unformatted string payload to digest explicitly.
 * @returns {QuestionType[]} - The fully validated assessment dataset safely.
 * @throws {Error} - If the text is definitively invalid or malformed structurally.
 */
export function parseAndValidateRawText(rawText) {
    logger.info("parseAndValidateRawText called", {
        rawText,
        characterCount: rawText ? rawText.trim().length : 0
    });
    const cleanText = rawText.trim();
    let parsedData = null;

    /* Attempts native JSON parsing first, failing over to custom QAD formatting on syntax errors or invalid schemas logically. */
    // ----------------------------------------------------------------------
    if (cleanText.startsWith("[")) {
        logger.debug("Attempting JSON parse on array syntax", {
            length: cleanText.length
        });
        try {
            parsedData = JSON.parse(cleanText);

            if (!Array.isArray(parsedData)) {
                logger.error(
                    "JSON parse failure: Root payload is not an array"
                );
                throw new Error(
                    "JSON payload must be wrapped in a root array."
                );
            }

            logger.info("JSON parsing succeeded", {
                questionCount: parsedData.length
            });
        } catch (jsonError) {
            const errMessage =
                jsonError instanceof Error
                    ? jsonError.message
                    : "Unknown parsing error";
            logger.warn("JSON parsing failed, falling back to QAD digestion", {
                error: errMessage
            });
        }
    }
    // ----------------------------------------------------------------------

    if (!parsedData) {
        logger.info("Falling back to parseQADFormat digestion");
        parsedData = parseQADFormat(cleanText);
    }

    if (!parsedData || parsedData.length === 0) {
        logger.error(
            "parseAndValidateRawText failure: No question structures parsed"
        );
        throw new Error("No valid QAD or JSON questions detected.");
    }

    logger.debug("Validating parsed dataset schema", {
        questionCount: parsedData.length
    });
    validateQuizSchema(parsedData);

    logger.info("Raw text parsing and validation completed successfully", {
        questionCount: parsedData.length
    });
    return parsedData;
}

/**
 * Validates the structural integrity of the ingested JSON dataset logically. Enforces bounds (1-7 answers total, exactly 1 correct answer per question).
 * @name validateQuizSchema
 * @public
 * @param {any[]} data - The parsed JSON data to validate natively.
 * @returns {void} - Does not return a value.
 * @throws {Error} - If the schema dynamically violates specifications.
 */
export function validateQuizSchema(data) {
    logger.info("validateQuizSchema called", {
        data,
        itemCount: Array.isArray(data) ? data.length : null
    });

    if (!Array.isArray(data) || data.length === 0) {
        logger.error(
            "validateQuizSchema error: Dataset is not a non-empty array",
            { data }
        );
        throw new Error("File must contain a non-empty array of questions.");
    }

    logger.debug("Validating individual question items", {
        questionCount: data.length
    });

    /* Iterates across every parsed question object strictly to guarantee formatting constraints are met globally. */
    // ----------------------------------------------------------------------
    for (let index = 0; index < data.length; index++) {
        const item = data[index];

        if (
            !item ||
            typeof item.question !== "string" ||
            item.question.trim() === "" ||
            !Array.isArray(item.answers)
        ) {
            logger.error(
                "validateQuizSchema error: Malformed question object or empty prompt",
                { index, item }
            );
            throw new Error(
                `Question #${index + 1} prompt text cannot be empty or whitespace-only.`
            );
        }

        if (item.answers.length < 2 || item.answers.length > 7) {
            logger.error(
                "validateQuizSchema error: Answer options out of bounds (2-7 allowed)",
                { index, count: item.answers.length }
            );
            throw new Error(
                `Question #${index + 1} contains ${item.answers.length} answers. Must contain between 2 and 7 items (at least 1 correct answer and 1 wrong answer).`
            );
        }

        let correctCount = 0;
        let wrongCount = 0;

        for (let ansIndex = 0; ansIndex < item.answers.length; ansIndex++) {
            const answer = item.answers[ansIndex];

            if (
                !answer ||
                typeof answer.text !== "string" ||
                answer.text.trim() === "" ||
                typeof answer.correct !== "boolean"
            ) {
                logger.error(
                    "validateQuizSchema error: Malformed answer option or empty text",
                    { index, ansIndex, answer }
                );
                throw new Error(
                    `Answer #${ansIndex + 1} at Question #${index + 1} text cannot be empty or whitespace-only, and must include a boolean 'correct' property.`
                );
            }

            if (answer.correct === true) {
                correctCount++;
            } else if (answer.correct === false) {
                wrongCount++;
            }
        }

        if (correctCount !== 1) {
            logger.error(
                "validateQuizSchema error: Question missing single correct answer",
                { index, correctCount }
            );
            throw new Error(
                `Question #${index + 1} must contain exactly ONE correct answer with 'correct: true' (found ${correctCount}).`
            );
        }

        if (wrongCount < 1) {
            logger.error(
                "validateQuizSchema error: Question missing wrong answer option",
                { index, wrongCount }
            );
            throw new Error(
                `Question #${index + 1} must contain at least ONE wrong answer option with 'correct: false'.`
            );
        }

        logger.trace("Question item passed schema check", {
            index: index + 1,
            answerCount: item.answers.length,
            correctCount
        });
    }
    // ----------------------------------------------------------------------

    logger.info("Quiz schema validation completed successfully", {
        questionCount: data.length
    });
}
