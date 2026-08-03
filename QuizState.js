/**
 * Manages the state and core logic for the interactive quiz application.
 * Encapsulates the question data, scoring, progression, and interaction locks
 * to strictly separate application logic from the DOM manipulation layer.
 */
class QuizState {
    /**
     * Initializes the quiz state with the provided dataset.
     * @param {Array<Object>} questions - The parsed array of question objects.
     */
    constructor(questions) {
        this.questionData = questions;
        this.score = 0;
        this.index = 0;
        this.disabled = false;
    }

    /**
     * Retrieves the current question object based on the active index.
     * @returns {Object} The current question object containing the text and answers array.
     */
    getCurrentQuestion() {
        return this.questionData[this.index];
    }

    /**
     * Increments the internal index to progress the quiz to the next question.
     */
    advanceQuestion() {
        this.index++;
    }

    /**
     * Calculates the user's current completion progress.
     * @returns {number} The completion percentage (0-100).
     */
    getProgressPercentage() {
        return (this.index / this.questionData.length) * 100;
    }

    /**
     * Evaluates a submitted answer, updates the score, and strictly locks the state
     * to prevent race conditions or multiple rapid submissions.
     * @param {boolean} isCorrect - Indicates whether the selected answer was correct.
     */
    evaluateAnswer(isCorrect) {
        if (this.disabled) return;
        this.disabled = true;
        if (isCorrect) {
            this.score++;
        }
    }

    /**
     * Unlocks the interaction state, allowing new answers to be processed.
     */
    resetClickLock() {
        this.disabled = false;
    }

    /**
     * Resets the entire quiz state back to its initial baseline values.
     */
    resetQuiz() {
        this.score = 0;
        this.index = 0;
        this.disabled = false;
    }

    /**
     * Determines if the user has reached or exceeded the end of the question dataset.
     * @returns {boolean} True if the quiz is complete, otherwise false.
     */
    isQuizOver() {
        return this.index >= this.questionData.length;
    }
}