import { createLogger } from "../utils/logger.js";

const logger = createLogger("QuizState");

/**
 * Core state model encapsulating dynamically injected quiz structures explicitly.
 * Retains pristine sequential order organically while providing active validation natively.
 *
 * @class QuizState
 * @name QuizState
 * @version 1.6.2
 * @author Adam Ross DeStafeno
 * @property {QuestionType[]} questionData - The parsed array of question objects.
 * @property {number} score - The user's current score.
 * @property {number} index - The current active question index.
 * @property {boolean} disabled - Indicates if interactions are locked during transitions.
 * @typedef {import('../types.js').QuestionType} QuestionType
 */
export default class QuizState {
  /**
   * Initializes the quiz state machine and hydrates it with the provided dataset. Note: Invokes an immediate randomization of the question pool on instantiation.
   * @name constructor
   * @public
   * @param {QuestionType[]} questionData - The parsed array of question objects to ingest.
   * @throws {Error} - If the question data is invalid or malformed.
   */
  constructor(questionData) {
    logger.info("constructor called", {
      questionData,
      questionCount: Array.isArray(questionData) ? questionData.length : 0
    });

    logger.debug("Initializing quiz state", {
      questionCount: Array.isArray(questionData) ? questionData.length : 0
    });

    if (!Array.isArray(questionData)) {
      logger.error("Invalid question data provided to QuizState constructor");
      throw new Error("QuizState requires an array of question objects.");
    }

    this.questionData = /** @type {QuestionType[]} */ (
      this.randomizeDeck(questionData)
    );
    this.score = 0;
    this.index = 0;
    this.disabled = false;

    logger.info("Quiz state initialized", {
      questionCount: this.questionData.length
    });
    logger.debug("QuizState machine primed for active questions");
  }

  /**
   * Retrieves the current question object based on the active state pointer. Time complexity: O(1).
   * @name getCurrentQuestion
   * @public
   * @returns {QuestionType} - The active question object containing the text and associated answers array.
   * @throws {Error} - If the current question cannot be retrieved.
   */
  getCurrentQuestion() {
    logger.info("getCurrentQuestion called", {
      activeIndex: this.index
    });
    logger.debug("Reading current question", { index: this.index });
    return this.questionData[this.index];
  }

  /**
   * Increments the internal state pointer to progress the quiz sequence. Shifts the application state forward.
   * @name advanceQuestion
   * @public
   * @returns {void} - Does not return a value.
   * @throws {Error} - If the index exceeds the bounds of the question dataset.
   */
  advanceQuestion() {
    logger.info("advanceQuestion called", {
      currentIndex: this.index
    });
    logger.debug("Advancing question index", {
      previousIndex: this.index
    });
    this.index++;
    logger.debug("Question index advanced", { newIndex: this.index });
  }

  /**
   * Computes the current user completion progress ratio.
   * @name getProgressPercentage
   * @public
   * @returns {number} - The progression metric represented as a percentage (0-100).
   * @throws {Error} - If the index exceeds the bounds of the question dataset.
   */
  getProgressPercentage() {
    logger.info("getProgressPercentage called", {
      index: this.index,
      total: this.questionData.length
    });
    logger.debug("Calculating progress percentage", {
      index: this.index,
      total: this.questionData.length
    });
    return ((this.index + 1) / this.questionData.length) * 100;
  }

  /**
   * Computes the user's final performance grade based on accumulated score.
   * @name getGradePercentage
   * @public
   * @returns {number} - The grade metric represented as a percentage (0-100).
   * @throws {Error} - If the score exceeds the bounds of the question dataset.
   */
  getGradePercentage() {
    logger.info("getGradePercentage called", {
      score: this.score,
      total: this.questionData.length
    });
    logger.debug("Calculating grade percentage", {
      score: this.score,
      total: this.questionData.length
    });
    return Math.round((this.score / this.questionData.length) * 100);
  }

  /**
   * Evaluates a submitted answer, manages state scoring, and enforces a strict interaction lock to prevent asynchronous race conditions or rapid multi-click mutations.
   * @name evaluateAnswer
   * @public
   * @param {boolean} isCorrect - Evaluated truthiness of the user's selected answer.
   * @returns {void} - Does not return a value.
   * @throws {Error} - If the answer is invalid or the quiz is in an invalid state.
   */
  evaluateAnswer(isCorrect) {
    logger.info("evaluateAnswer called", {
      isCorrect,
      currentScore: this.score,
      isLocked: this.disabled
    });
    if (this.disabled) {
      logger.warn("Answer evaluation skipped because click lock is active");
      return;
    }

    this.disabled = true;

    if (isCorrect) {
      this.score++;
      logger.info("Correct answer registered. Incremented score", {
        newScore: this.score
      });
      logger.debug("Score incremented", { score: this.score });
    } else {
      logger.info("Incorrect answer registered. Score remains unchanged", {
        currentScore: this.score
      });
      logger.debug("Score unchanged", { score: this.score });
    }

    logger.info("Answer evaluated", {
      isCorrect,
      score: this.score,
      disabled: this.disabled
    });
  }

  /**
   * Releases the interaction lock, permitting the evaluation of subsequent answers.
   * @name resetClickLock
   * @public
   * @returns {void} - Does not return a value.
   * @throws {Error} - If the click lock cannot be reset.
   */
  resetClickLock() {
    logger.info("resetClickLock called");
    this.disabled = false;
    logger.debug("Click lock reset");
  }

  /**
   * Resets the state machine back to its baseline parameters for a new session. Triggers a fresh memory reallocation and shuffle of the dataset.
   * @name resetQuiz
   * @public
   * @returns {void} - Does not return a value.
   * @throws {Error} - If the quiz cannot be reset.
   */
  resetQuiz() {
    logger.info("resetQuiz called", {
      currentScore: this.score,
      currentIndex: this.index
    });
    logger.debug("Resetting quiz state indices and shuffling deck", {
      score: this.score,
      index: this.index
    });
    this.score = 0;
    this.index = 0;
    this.disabled = false;
    this.questionData = this.randomizeDeck(this.questionData);
    logger.info("Quiz state reset complete", {
      questionCount: this.questionData.length
    });
  }

  /**
   * Evaluates the active state pointer against the dataset boundary to determine termination. Time complexity: O(1).
   * @name isQuizOver
   * @public
   * @returns {boolean} - True if the pointer has reached or exceeded the dataset length.
   * @throws {Error} - If the index exceeds the bounds of the question dataset.
   */
  isQuizOver() {
    logger.info("isQuizOver called", {
      index: this.index,
      total: this.questionData.length
    });
    const isOver = this.index >= this.questionData.length;
    logger.debug("Checking quiz completion", {
      index: this.index,
      total: this.questionData.length,
      isOver
    });
    return isOver;
  }

  /**
   * Performs an in-place Fisher-Yates shuffle on the provided array. Time complexity: O(n).
   * @name shuffleQuizData
   * @public
   * @param {Array<any>} array - The target array to mutate.
   * @returns {Array<any>} - A reference to the mutated array to allow method chaining.
   * @throws {Error} - If the array is not an array.
   */
  shuffleQuizData(array) {
    logger.info("shuffleQuizData called", {
      array,
      length: Array.isArray(array) ? array.length : null
    });
    logger.debug("Shuffling array in-place", { length: array.length });
    /* Loops sequentially backward to swap array elements in place, preventing redundant memory allocation. */
    // ----------------------------------------------------------------------
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    // ----------------------------------------------------------------------
    logger.debug("Shuffle complete", { length: array.length });
    return array;
  }

  /**
   * Orchestrates the randomization of the entire quiz dataset matrix. Shuffles both the primary array (questions) and nested subarrays (answers). Time complexity: O(n * m).
   * @name randomizeDeck
   * @public
   * @param {QuestionType[]} deck - The collection of question objects to randomize.
   * @returns {QuestionType[]} - A reference to the fully randomized matrix.
   * @throws {Error} - If the deck is not an array or is empty.
   */
  randomizeDeck(deck) {
    logger.info("randomizeDeck called", {
      deck,
      deckLength: Array.isArray(deck) ? deck.length : null
    });
    logger.debug("Randomizing quiz deck", {
      questionCount: deck.length
    });
    // Shuffles the outer container array representing the question sequence.
    const shuffledDeck = this.shuffleQuizData(deck);

    // Traverses the newly shuffled array to shuffle the inner answer sequences.
    shuffledDeck.forEach((question) => {
      logger.trace("randomizeDeck: questionAnswerShuffleCallback", {
        questionText: question.question
      });
      question.answers = this.shuffleQuizData(question.answers);
    });

    logger.info("Quiz deck randomized", {
      questionCount: shuffledDeck.length
    });
    return shuffledDeck;
  }
}
