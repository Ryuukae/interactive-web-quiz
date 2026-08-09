// ========================
// --- QUIZ STATE MODEL ---
// ========================

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
     * @param {Array<Object>} questionData - The parsed array of question objects to ingest.
     * @returns {void} - Does not return a value.
     */
    constructor(questionData) {
        this.questionData = this.randomizeDeck(questionData);
        
        this.score = 0;
        this.index = 0;
        
        this.disabled = false;
    }

    /**
     * @name getCurrentQuestion
     * @public
     * @description Retrieves the current question object based on the active state pointer. Time complexity: O(1).
     * @returns {Object} - The active question object containing the text and associated answers array.
     */
    getCurrentQuestion() {
        return this.questionData[this.index];
    }

    /**
     * @name advanceQuestion
     * @public
     * @description Increments the internal state pointer to progress the quiz sequence. Shifts the application state forward.
     * @returns {void} - Does not return a value.
     */
    advanceQuestion() {
        this.index++;
    }

    /**
     * @name getProgressPercentage
     * @public
     * @description Computes the current user completion progress ratio.
     * @returns {number} - The progression metric represented as a percentage (0-100).
     */
    getProgressPercentage() {
        return ((this.index + 1) / this.questionData.length) * 100;
    }

    /**
     * @name getGradePercentage
     * @public
     * @description Computes the user's final performance grade based on accumulated score.
     * @returns {number} - The grade metric represented as a percentage (0-100).
     */
    getGradePercentage() {
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
        if (this.disabled) return;
        
        this.disabled = true;
        
        if (isCorrect) {
            this.score++;
        }
    }

    /**
     * @name resetClickLock
     * @public
     * @description Releases the interaction lock, permitting the evaluation of subsequent answers.
     * @returns {void} - Does not return a value.
     */
    resetClickLock() {
        this.disabled = false;
    }

    /**
     * @name resetQuiz
     * @public
     * @description Resets the state machine back to its baseline parameters for a new session. Triggers a fresh memory reallocation and shuffle of the dataset.
     * @returns {void} - Does not return a value.
     */
    resetQuiz() {
        this.score = 0;
        this.index = 0;
        this.disabled = false;
        this.questionData = this.randomizeDeck(this.questionData);
    }

    /**
     * @name isQuizOver
     * @public
     * @description Evaluates the active state pointer against the dataset boundary to determine termination. Time complexity: O(1).
     * @returns {boolean} - True if the pointer has reached or exceeded the dataset length.
     */
    isQuizOver() {
        return this.index >= this.questionData.length;
    }

    /**
     * @name shuffleQuizData
     * @public
     * @description Performs an in-place Fisher-Yates shuffle on the provided array. Time complexity: O(n).
     * @param {Array} array - The target array to mutate.
     * @returns {Array} - A reference to the mutated array to allow method chaining.
     */
    shuffleQuizData(array) {
        /* Loops sequentially backward to swap array elements in place, preventing redundant memory allocation. */
        // ----------------------------------------------------------------------
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        // ----------------------------------------------------------------------
        return array;
    }

    /**
     * @name randomizeDeck
     * @public
     * @description Orchestrates the randomization of the entire quiz dataset matrix. Shuffles both the primary array (questions) and nested subarrays (answers). Time complexity: O(n * m).
     * @param {Array<Object>} deck - The collection of question objects to randomize.
     * @returns {Array<Object>} - A reference to the fully randomized matrix.
     */
    randomizeDeck(deck) {
        // Shuffles the outer container array representing the question sequence.
        const shuffledDeck = this.shuffleQuizData(deck);
        
        // Traverses the newly shuffled array to shuffle the inner answer sequences.
        shuffledDeck.forEach(question => {
            question.answers = this.shuffleQuizData(question.answers);
        });

        return shuffledDeck;
    }
}