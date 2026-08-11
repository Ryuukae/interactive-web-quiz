// ========================
// --- QUIZ STATE MODEL ---
// ========================

import { createLogger } from "../utils/logger.js";

/**
 * @typedef {object} AnswerType
 * @property {string} text
 * @property {boolean} correct
 */

/**
 * @typedef {object} QuestionType
 * @property {string} question
 * @property {AnswerType[]} answers
 */

/**
 * @class QuizState
 * @name QuizState
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
 * @description
 * Architectural Responsibilities: Manages the state and core logic for the interactive quiz application. Encapsulates the question dataset, scoring metrics, progression tracking, and interaction locks to strictly decouple business logic from the DOM manipulation layer.
 *
 * Encapsulation Scope: Isolated execution state for a single active assessment.
 */
export default class QuizState {
    /**
     * @name constructor
     * @public
     * @description Initializes the quiz state machine and hydrates it with the provided dataset. Note: Invokes an immediate randomization of the question pool on instantiation.
     * @param {QuestionType[]} questionData - The parsed array of question objects to ingest.
     */
    constructor(questionData) {
        this.logger = createLogger("QuizState");
        this.logger.info("constructor called", {
            questionData,
            questionCount: Array.isArray(questionData) ? questionData.length : 0
        });
        this.questionData = this.randomizeDeck(questionData);

        this.score = 0;
        this.index = 0;

        this.disabled = false;
        this.logger.info("Quiz state initialized", {
            questionCount: this.questionData.length
        });
    }

    /**
     * @name getCurrentQuestion
     * @public
     * @description Retrieves the current question object based on the active state pointer. Time complexity: O(1).
     * @returns {QuestionType} - The active question object containing the text and associated answers array.
     */
    getCurrentQuestion() {
        this.logger.info("getCurrentQuestion called", {
            activeIndex: this.index
        });
        this.logger.trace("Reading current question", { index: this.index });
        return this.questionData[this.index];
    }

    /**
     * @name advanceQuestion
     * @public
     * @description Increments the internal state pointer to progress the quiz sequence. Shifts the application state forward.
     * @returns {void} - Does not return a value.
     */
    advanceQuestion() {
        this.logger.info("advanceQuestion called", {
            currentIndex: this.index
        });
        this.logger.debug("Advancing question index", {
            previousIndex: this.index
        });
        this.index++;
        this.logger.debug("Question index advanced", { newIndex: this.index });
    }

    /**
     * @name getProgressPercentage
     * @public
     * @description Computes the current user completion progress ratio.
     * @returns {number} - The progression metric represented as a percentage (0-100).
     */
    getProgressPercentage() {
        this.logger.info("getProgressPercentage called", {
            index: this.index,
            total: this.questionData.length
        });
        this.logger.trace("Calculating progress percentage", {
            index: this.index,
            total: this.questionData.length
        });
        return ((this.index + 1) / this.questionData.length) * 100;
    }

    /**
     * @name getGradePercentage
     * @public
     * @description Computes the user's final performance grade based on accumulated score.
     * @returns {number} - The grade metric represented as a percentage (0-100).
     */
    getGradePercentage() {
        this.logger.info("getGradePercentage called", {
            score: this.score,
            total: this.questionData.length
        });
        this.logger.trace("Calculating grade percentage", {
            score: this.score,
            total: this.questionData.length
        });
        return Math.round((this.score / this.questionData.length) * 100);
    }

    /**
     * @name evaluateAnswer
     * @public
     * @description Evaluates a submitted answer, manages state scoring, and enforces a strict interaction lock to prevent asynchronous race conditions or rapid multi-click mutations.
     * @param {boolean} isCorrect - Evaluated truthiness of the user's selected answer.
     * @returns {void} - Does not return a value.
     */
    evaluateAnswer(isCorrect) {
        this.logger.info("evaluateAnswer called", {
            isCorrect,
            currentScore: this.score,
            isLocked: this.disabled
        });
        if (this.disabled) {
            this.logger.warn(
                "Answer evaluation skipped because click lock is active"
            );
            return;
        }

        this.disabled = true;

        if (isCorrect) {
            this.score++;
            this.logger.info("Correct answer registered. Incremented score", {
                newScore: this.score
            });
        } else {
            this.logger.info(
                "Incorrect answer registered. Score remains unchanged",
                { currentScore: this.score }
            );
        }

        this.logger.info("Answer evaluated", {
            isCorrect,
            score: this.score,
            disabled: this.disabled
        });
    }

    /**
     * @name resetClickLock
     * @public
     * @description Releases the interaction lock, permitting the evaluation of subsequent answers.
     * @returns {void} - Does not return a value.
     */
    resetClickLock() {
        this.logger.info("resetClickLock called");
        this.disabled = false;
        this.logger.debug("Click lock reset");
    }

    /**
     * @name resetQuiz
     * @public
     * @description Resets the state machine back to its baseline parameters for a new session. Triggers a fresh memory reallocation and shuffle of the dataset.
     * @returns {void} - Does not return a value.
     */
    resetQuiz() {
        this.logger.info("resetQuiz called", {
            currentScore: this.score,
            currentIndex: this.index
        });
        this.logger.info("Resetting quiz state", {
            score: this.score,
            index: this.index
        });
        this.score = 0;
        this.index = 0;
        this.disabled = false;
        this.questionData = this.randomizeDeck(this.questionData);
        this.logger.info("Quiz state reset complete", {
            questionCount: this.questionData.length
        });
    }

    /**
     * @name isQuizOver
     * @public
     * @description Evaluates the active state pointer against the dataset boundary to determine termination. Time complexity: O(1).
     * @returns {boolean} - True if the pointer has reached or exceeded the dataset length.
     */
    isQuizOver() {
        this.logger.info("isQuizOver called", {
            index: this.index,
            total: this.questionData.length
        });
        const isOver = this.index >= this.questionData.length;
        this.logger.trace("Checking quiz completion", {
            index: this.index,
            total: this.questionData.length,
            isOver
        });
        return isOver;
    }

    /**
     * @name shuffleQuizData
     * @public
     * @description Performs an in-place Fisher-Yates shuffle on the provided array. Time complexity: O(n).
     * @param {Array<any>} array - The target array to mutate.
     * @returns {Array<any>} - A reference to the mutated array to allow method chaining.
     */
    shuffleQuizData(array) {
        this.logger.info("shuffleQuizData called", {
            array,
            length: Array.isArray(array) ? array.length : null
        });
        this.logger.trace("Shuffling array", { length: array.length });
        /* Loops sequentially backward to swap array elements in place, preventing redundant memory allocation. */
        // ----------------------------------------------------------------------
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        // ----------------------------------------------------------------------
        this.logger.trace("Shuffle complete", { length: array.length });
        return array;
    }

    /**
     * @name randomizeDeck
     * @public
     * @description Orchestrates the randomization of the entire quiz dataset matrix. Shuffles both the primary array (questions) and nested subarrays (answers). Time complexity: O(n * m).
     * @param {QuestionType[]} deck - The collection of question objects to randomize.
     * @returns {QuestionType[]} - A reference to the fully randomized matrix.
     */
    randomizeDeck(deck) {
        this.logger.info("randomizeDeck called", {
            deck,
            deckLength: Array.isArray(deck) ? deck.length : null
        });
        this.logger.debug("Randomizing quiz deck", {
            questionCount: deck.length
        });
        // Shuffles the outer container array representing the question sequence.
        const shuffledDeck = this.shuffleQuizData(deck);

        // Traverses the newly shuffled array to shuffle the inner answer sequences.
        shuffledDeck.forEach((question) => {
            this.logger.trace("randomizeDeck: questionAnswerShuffleCallback", {
                questionText: question.question
            });
            question.answers = this.shuffleQuizData(question.answers);
        });

        this.logger.info("Quiz deck randomized", {
            questionCount: shuffledDeck.length
        });
        return shuffledDeck;
    }
}
