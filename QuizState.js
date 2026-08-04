/**
 * Manages the state and core logic for the interactive quiz application.
 * Encapsulates the question dataset, scoring metrics, progression tracking, 
 * and interaction locks to strictly decouple business logic from the DOM manipulation layer.
 */
class QuizState {
    /**
     * Initializes the quiz state machine and hydrates it with the provided dataset.
     * Note: Invokes an immediate O(n * m) randomization of the question pool on instantiation.
     * 
     * @param {Array<Object>} questions - The parsed array of question objects to ingest.
     */
    constructor(questions) {
      this.questionData = this.randomizeDeck(questions);
      this.score = 0;
      this.index = 0;
      this.disabled = false;
    }
  
    /**
     * Retrieves the current question object based on the active state pointer.
     * Time complexity: O(1).
     * 
     * @returns {Object} The active question object containing the text and associated answers array.
     */
    getCurrentQuestion() {
      return this.questionData[this.index];
    }
  
    /**
     * Increments the internal state pointer to progress the quiz sequence.
     */
    advanceQuestion() {
      this.index++;
    }
  
    /**
     * Computes the current user completion progress ratio.
     * 
     * @returns {number} The progression metric represented as a percentage (0-100).
     */
    getProgressPercentage() {
      return (this.index / this.questionData.length) * 100;
    }
  
    /**
     * Computes the user's final performance grade based on accumulated score.
     * 
     * @returns {number} The grade metric represented as a percentage (0-100).
     */
    getGradePercentage() {
      return (this.score / this.questionData.length) * 100;
    }
  
    /**
     * Evaluates a submitted answer, manages state scoring, and enforces a strict 
     * interaction lock to prevent asynchronous race conditions or rapid multi-click mutations.
     * 
     * @param {boolean} isCorrect - Evaluated truthiness of the user's selected answer.
     */
    evaluateAnswer(isCorrect) {
      if (this.disabled) return;
      
      this.disabled = true;
      
      if (isCorrect) {
        this.score++;
      }
    }
  
    /**
     * Releases the interaction lock, permitting the evaluation of subsequent answers.
     */
    resetClickLock() {
      this.disabled = false;
    }
  
    /**
     * Resets the state machine back to its baseline parameters for a new session.
     * Triggers a fresh O(n * m) memory reallocation and shuffle of the dataset.
     */
    resetQuiz() {
      this.score = 0;
      this.index = 0;
      this.disabled = false;
      this.questionData = this.randomizeDeck(this.questionData);
    }
  
    /**
     * Evaluates the active state pointer against the dataset boundary to determine termination.
     * Time complexity: O(1).
     * 
     * @returns {boolean} True if the pointer has reached or exceeded the dataset length.
     */
    isQuizOver() {
      return this.index >= this.questionData.length;
    }
  
    /**
     * Performs an in-place Fisher-Yates shuffle on the provided array.
     * Time complexity: O(n).
     * 
     * @param {Array} array - The target array to mutate.
     * @returns {Array} A reference to the mutated array to allow method chaining.
     */
    shuffleQuizData(array) {
      for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
      }
      return array;
    }
  
    /**
     * Orchestrates the randomization of the entire quiz dataset matrix.
     * Shuffles both the primary array (questions) and nested subarrays (answers).
     * Time complexity: O(n * m) where n is questions and m is answers per question.
     * 
     * Note: This operates in-place and permanently mutates the incoming data structure.
     * 
     * @param {Array<Object>} deck - The collection of question objects to randomize.
     * @returns {Array<Object>} A reference to the fully randomized matrix.
     */
    randomizeDeck(deck) {
      // Shuffle the top-level question pool
      const shuffledDeck = this.shuffleQuizData(deck);
      
      // Traverse and shuffle the nested answer sets for each question node
      shuffledDeck.forEach(question => {
        question.answers = this.shuffleQuizData(question.answers);
      });
  
      return shuffledDeck;
    }
  }