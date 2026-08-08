/**
 * @class QuizState
 * @name QuizState
 * @description 
 * Architectural Responsibilities: Manages the state and core logic for the interactive quiz application. 
 * Encapsulates the question dataset, scoring metrics, progression tracking, and interaction locks 
 * to strictly decouple business logic from the DOM manipulation layer.
 * 
 * Encapsulation Scope: Isolated execution state for a single active assessment.
 */
class QuizState {
    
  /**
   * @name constructor
   * @description Initializes the quiz state machine and hydrates it with the provided dataset. Note: Invokes an immediate O(n * m) randomization of the question pool on instantiation.
   * @param {Array<Object>} questionData - The parsed array of question objects to ingest.
   * @returns {void} - Does not return a value.
   */
  constructor(questionData) {
      // Ingest the raw data layer and immediately randomize it. 
      // This creates our unpredictable baseline for the user session.
      this.questionData = this.randomizeDeck(questionData);
      
      // Initialize mutable state trackers
      this.score = 0;
      this.index = 0;
      
      // Establish the baseline interaction lock to manage asynchronous flow
      this.disabled = false;
  }

  /**
   * @name getCurrentQuestion
   * @description Retrieves the current question object based on the active state pointer. Time complexity: O(1).
   * @returns {Object} The active question object containing the text and associated answers array.
   */
  getCurrentQuestion() {
      // Utilizes a direct O(1) index lookup to fetch the active node. 
      // This avoids computationally expensive array traversals on every render cycle.
      return this.questionData[this.index];
  }

  /**
   * @name advanceQuestion
   * @description Increments the internal state pointer to progress the quiz sequence. Shifts the application state forward.
   * @returns {void} - Does not return a value.
   */
  advanceQuestion() {
      // Mutates the internal pointer to shift the application state forward
      this.index++;
  }

  /**
   * @name getProgressPercentage
   * @description Computes the current user completion progress ratio.
   * @returns {number} The progression metric represented as a percentage (0-100).
   */
  getProgressPercentage() {
      // Computes derived state on the fly rather than caching it as a property.
      // This strictly prevents state desynchronization bugs where the index updates but a cached percentage does not.
      return ((this.index + 1) / this.questionData.length) * 100;
  }

  /**
   * @name getGradePercentage
   * @description Computes the user's final performance grade based on accumulated score.
   * @returns {number} The grade metric represented as a percentage (0-100).
   */
  getGradePercentage() {
      /* Dynamically scales the grading threshold based on the arbitrary length of the ingested dataset
         and rounds the value to the nearest integer for a clean display of the percentage. */
      return Math.round((this.score / this.questionData.length) * 100);
  }

  /**
   * @name evaluateAnswer
   * @description Evaluates a submitted answer, manages state scoring, and enforces a strict interaction lock to prevent asynchronous race conditions or rapid multi-click mutations.
   * @param {boolean} isCorrect - Evaluated truthiness of the user's selected answer.
   * @returns {void} - Does not return a value.
   */
  evaluateAnswer(isCorrect) {
      // Enforce idempotency. This lock guarantees that a user spam-clicking an answer 
      // cannot evaluate the same question multiple times, artificially inflating the score or breaking the state.
      if (this.disabled) return;
      
      // Lock the state machine immediately upon the first valid execution
      this.disabled = true;
      
      if (isCorrect) {
          this.score++;
      }
  }

  /**
   * @name resetClickLock
   * @description Releases the interaction lock, permitting the evaluation of subsequent answers.
   * @returns {void} - Does not return a value.
   */
  resetClickLock() {
      // Safely re-opens the state machine to input for the next active sequence
      this.disabled = false;
  }

  /**
   * @name resetQuiz
   * @description Resets the state machine back to its baseline parameters for a new session. Triggers a fresh O(n * m) memory reallocation and shuffle of the dataset.
   * @returns {void} - Does not return a value.
   */
  resetQuiz() {
      // Reset trackers to baseline
      this.score = 0;
      this.index = 0;
      this.disabled = false;
      
      // Re-trigger the randomization matrix to ensure the new session is entirely distinct from the previous one
      this.questionData = this.randomizeDeck(this.questionData);
  }

  /**
   * @name isQuizOver
   * @description Evaluates the active state pointer against the dataset boundary to determine termination. Time complexity: O(1).
   * @returns {boolean} True if the pointer has reached or exceeded the dataset length.
   */
  isQuizOver() {
      // Defines the boundary condition for the application's main loop
      return this.index >= this.questionData.length;
  }

  /**
   * @name shuffleQuizData
   * @description Performs an in-place Fisher-Yates shuffle on the provided array. Time complexity: O(n).
   * @param {Array} array - The target array to mutate.
   * @returns {Array} A reference to the mutated array to allow method chaining.
   */
  shuffleQuizData(array) {
      for (let i = array.length - 1; i > 0; i--) {
          // Generate a cryptographically viable random index
          const j = Math.floor(Math.random() * (i + 1));
          
          // Execute an in-place swap using destructuring assignment.
          // This maintains an O(1) space complexity by preventing the allocation of a duplicate array in memory.
          [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
  }

  /**
   * @name randomizeDeck
   * @description Orchestrates the randomization of the entire quiz dataset matrix. Shuffles both the primary array (questions) and nested subarrays (answers). Time complexity: O(n * m).
   * @param {Array<Object>} deck - The collection of question objects to randomize.
   * @returns {Array<Object>} A reference to the fully randomized matrix.
   */
  randomizeDeck(deck) {
      // Pass 1: Shuffle the outer container (the question sequence)
      const shuffledDeck = this.shuffleQuizData(deck);
      
      // Pass 2: Traverse the newly shuffled array and shuffle the inner containers (the answer sequences)
      shuffledDeck.forEach(question => {
          question.answers = this.shuffleQuizData(question.answers);
      });

      // Return the deeply randomized structure reference
      return shuffledDeck;
  }
}