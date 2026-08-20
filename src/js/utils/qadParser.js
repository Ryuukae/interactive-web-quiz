import { createLogger } from "./logger.js";

const logger = createLogger("qadParser");

/**
 * Parses raw QAD formatted text strings into valid question objects.
 * Enforces strict schema rules: 1 Question, 1 Answer, and 1-6 Distractors.
 *
 * @module qadParser
 * @version 1.5.2
 * @author Adam Ross DeStafeno
 * @typedef {import('../types.js').QuestionType} QuestionType
 * @typedef {import('../types.js').AnswerType} AnswerType
 */

/**
 * Initializes a new question block object.
 * @param {string} question - The text of the question.
 * @returns {QuestionType} - The initialized question object.
 */
function createQuestionBlock(question) {
  logger.debug("createQuestionBlock called", { question });
  return { question, answers: [] };
}

/**
 * Parses custom QAD text files exclusively into a standardized JSON array optimally for the application natively.
 * @name parseQADFormat
 * @public
 * @param {string} rawText - The raw text payload string from the optimally uploaded file or physically typed textarea.
 * @returns {QuestionType[]} - Formatted question objects sequentially ready for state ingestion globally.
 * @throws {Error} - Throws an explicit string error conclusively if structural formatting bounds are violated natively.
 */
export function parseQADFormat(rawText) {
  logger.info("parseQADFormat called", {
    rawText,
    characterCount: rawText ? rawText.length : 0
  });
  logger.debug("Normalizing and tokenizing raw QAD payload");

  const normalizedText = rawText.replace(/\r\n/g, "\n").trim();
  if (!normalizedText) {
    logger.error("QAD parse error: Empty payload provided");
    throw new Error("No valid question blocks detected.");
  }

  /**
   * Array of parsed tokens.
   * @type {Array<{ tag: string, value: string }>}
   */
  const tokens = [];
  let pos = 0;
  const len = normalizedText.length;

  while (pos < len) {
    let gap = "";
    const gapStart = pos;
    // Skip whitespace between tokens and record the gap
    while (pos < len && /\s/.test(normalizedText[pos])) {
      pos++;
    }
    gap = normalizedText.slice(gapStart, pos);

    if (pos >= len) break;

    // Match tag: Q=, A=, D=
    const remaining = normalizedText.slice(pos);
    const tagMatch = remaining.match(/^([qQaAdD])=/);
    if (!tagMatch) {
      logger.error("QAD parse error: Unexpected text before tag", {
        snippet: remaining.slice(0, 40)
      });
      throw new Error(
        `Malformed QAD line. Expected 'Q=', 'A=', or 'D=' tag near: "${remaining.slice(0, 30)}..."`
      );
    }

    const tag = tagMatch[1].toLowerCase();

    // Check if there are illegal blank lines or trailing characters between Q, A, and D lines within the same question group
    if (tokens.length > 0 && tag !== "q") {
      if (!/^\n[ \t]*$/.test(gap)) {
        logger.error(
          "QAD parse error: Illegal spacing or blank line between entries in same block",
          { tag, gap }
        );
        throw new Error(
          `Malformed QAD block: No empty lines or trailing spaces permitted between Q, A, and D lines within the same question group.`
        );
      }
    }

    pos += tagMatch[0].length;

    // Enforce that quotes ("..." or '...') are required immediately after the = sign
    if (
      pos >= len ||
      (normalizedText[pos] !== '"' && normalizedText[pos] !== "'")
    ) {
      logger.error("QAD parse error: Missing opening quote after tag", { tag });
      throw new Error(
        `QAD format requires values to be enclosed in quotes immediately after '${tag.toUpperCase()}=' (e.g., ${tag.toUpperCase()}="...").`
      );
    }

    const quoteChar = normalizedText[pos];
    pos++; // Skip opening quote
    const valueStart = pos;
    let isEscaped = false;
    let closedQuote = false;

    while (pos < len) {
      const ch = normalizedText[pos];
      if (isEscaped) {
        isEscaped = false;
      } else if (ch === "\\") {
        isEscaped = true;
      } else if (ch === quoteChar) {
        closedQuote = true;
        break;
      }
      pos++;
    }

    if (!closedQuote) {
      logger.error("QAD parse error: Unclosed quote detected", { tag });
      throw new Error(
        `Unclosed quote detected for '${tag.toUpperCase()}=' block. Make sure to close your quotes.`
      );
    }

    let value = normalizedText.slice(valueStart, pos);
    // Unescape escaped quotes
    value = value.replace(new RegExp(`\\\\${quoteChar}`, "g"), quoteChar);
    pos++; // Skip closing quote

    tokens.push({ tag, value: value.trim() });
  }

  const questions = [];
  let currentQuestion = null;
  let answerCount = 0;
  let distractorCount = 0;

  for (const token of tokens) {
    const { tag, value } = token;

    if (tag === "q") {
      if (currentQuestion !== null) {
        logger.debug("Finalizing previous question block", {
          question: currentQuestion.question
        });
        validateBlock(currentQuestion, answerCount, distractorCount);
        questions.push(currentQuestion);
      }

      if (!value) {
        logger.error("QAD parse error: Empty question prompt");
        throw new Error("Question block is missing prompt text inside quotes.");
      }

      currentQuestion = createQuestionBlock(value);
      logger.debug("Parsed question header", {
        question: currentQuestion.question
      });

      answerCount = 0;
      distractorCount = 0;
    } else if (tag === "a") {
      if (currentQuestion === null) {
        logger.error("QAD parse error: Orphaned answer detected");
        throw new Error(
          "Orphaned answer detected. Every block must start with 'Q=\"...\"'."
        );
      }

      if (answerCount >= 1) {
        logger.error(
          "QAD parse error: Multiple correct answers detected in block",
          { question: currentQuestion.question }
        );
        throw new Error(
          "Malformed block: Each question group can only have exactly one 'A=\"...\"' entry."
        );
      }

      if (!value) {
        logger.error("QAD parse error: Empty correct answer text");
        throw new Error(
          `Correct answer 'A=' for question "${currentQuestion.question || "unnamed"}" cannot be empty inside quotes.`
        );
      }

      currentQuestion.answers.push({
        text: value,
        correct: true
      });
      answerCount++;
      logger.trace("Parsed correct answer", {
        question: currentQuestion.question,
        answerCount
      });
    } else if (tag === "d") {
      if (currentQuestion === null) {
        logger.error("QAD parse error: Orphaned distractor detected");
        throw new Error(
          "Orphaned distractor detected. Every block must start with 'Q=\"...\"'."
        );
      }

      if (!value) {
        logger.error("QAD parse error: Empty distractor text");
        throw new Error(
          `Distractor 'D=' for question "${currentQuestion.question || "unnamed"}" cannot be empty inside quotes.`
        );
      }

      currentQuestion.answers.push({
        text: value,
        correct: false
      });
      distractorCount++;
      logger.trace("Parsed distractor", {
        question: currentQuestion.question,
        distractorCount
      });
    }
  }

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
  logger.debug("Returning parsed question list", { count: questions.length });
  return questions;
}

/**
 * Helper method to validate that a parsed QAD block meets strict structural requirements.
 * @name validateBlock
 * @private
 * @param {QuestionType} block - The question object being assembled.
 * @param {number} answers - Count of correct answers found.
 * @param {number} distractors - Count of distractors found.
 * @returns {void} - Does not return a value.
 * @throws {Error} - Throws an explicit error if counts fall outside acceptable parameters.
 */
function validateBlock(block, answers, distractors) {
  logger.info("validateBlock called", { block, answers, distractors });
  logger.debug("Validating single QAD block counts", { answers, distractors });

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
