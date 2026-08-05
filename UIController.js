/**
 * UIController Class
 * Encapsulates all DOM element caching, event listener bindings, 
 * and UI rendering operations for the interactive quiz application.
 */
class UIController {
    
    // ==========================================
    // --- DOM CACHING & INITIALIZATION       ---
    // ==========================================

    /**
     * Instantiates the controller, caches DOM references, and sets up event delegation.
     * @param {QuizState} quizState - The active instance of the state manager.
     */
    constructor(quizState) {
      // Inject the state dependency so the UI controller can read from and write to the data layer
      this.quizState = quizState;

      // Cache DOM elements in memory once on initialization. 
      // This prevents expensive and synchronous document.getElementById() lookups during rapid UI repaints.
      this.startScreen = document.getElementById("start-screen");
      this.quizScreen = document.getElementById("quiz-screen");
      this.resultScreen = document.getElementById("result-screen");
      this.startButton = document.getElementById("start-btn");
      this.questionText = document.getElementById("question-text");
      this.answersContainer = document.getElementById("answers-container");
      this.currentQuestionSpan = document.getElementById("current-question");
      this.totalQuestionsSpan = document.getElementById("totalQuestionsSpan");
      this.scoreSpan = document.getElementById("score");
      this.finalScoreSpan = document.getElementById("final-score");
      this.maxScoreSpan = document.getElementById("max-score");
      this.resultMessage = document.getElementById("result-message");
      this.restartButton = document.getElementById("restart-btn");
      this.progressBar = document.getElementById("progress");

      // Cache the new DOM nodes required for the custom JSON upload feature
      this.fileInput = document.getElementById("custom-file-input");
      this.fileStatus = document.getElementById("file-name-display");

      // Instantiate the file loader class, injecting the required DOM nodes.
      // This immediately binds the asynchronous file listener behind the scenes.
      this.dataLoader = new QuizDataLoader(this.fileInput, this.fileStatus);

      // Immediately bind static global events now that the DOM references exist
      this.initializeEventListeners();
    }

    // ==========================================
    // --- EVENT LISTENER DELEGATION          ---
    // ==========================================

    /**
     * Binds click events to static buttons.
     * Uses arrow functions to preserve the class scope (`this`).
     */
    initializeEventListeners() {
      // Arrow functions map the lexical 'this' to the UIController instance. 
      // Without them, 'this' would refer to the HTML button triggering the event, breaking our class scope.
      this.startButton.addEventListener("click", () => this.startQuiz());
      this.restartButton.addEventListener("click", () => this.restartQuiz());
    }

    // ==========================================
    // --- QUIZ FLOW & RENDERING LOGIC        ---
    // ==========================================

    /**
     * Synchronizes static UI bounds with the loaded dataset length.
     */
    synchronizeBounds() {
      // Establish the ceiling metrics for the UI based on the dynamically loaded dataset
      const totalCount = this.quizState.questionData.length;
      this.totalQuestionsSpan.textContent = totalCount;
      this.maxScoreSpan.textContent = totalCount;
    }

    /**
     * Starts a new quiz session and reveals the active screen.
     * Evaluates the data loader for a custom client-side payload before execution.
     */
    startQuiz() {
      // Evaluate the data loader to check if a valid custom payload exists in local memory
      const customPayload = this.dataLoader.getCustomData();
      
      if (customPayload) {
          console.log("Custom payload detected. Hydrating new state machine.");
          
          // Overwrite the existing state machine with the custom dataset, bypassing the default server fetch
          this.quizState = new QuizState(customPayload);
          
          // Re-sync the ceiling bounds (total questions, max score) for the newly injected dataset length
          this.synchronizeBounds();
      }

      // Reset the underlying data model before touching the view
      this.quizState.resetQuiz();
      
      // Synchronize the starting score baseline
      this.scoreSpan.textContent = this.quizState.score;

      // Execute the SPA routing by swapping the CSS visibility classes
      this.startScreen.classList.remove("active");
      this.quizScreen.classList.add("active");

      // Trigger the first dynamic render cycle
      this.showQuestion();
    }

    /**
     * Renders the current question and dynamically generates answer choices.
     */
    showQuestion() {
      // Lift the interaction lock to allow the user to make a new selection
      this.quizState.resetClickLock();
      
      // Pull the current chunk of data from the state manager
      const currentQuestion = this.quizState.getCurrentQuestion();

      // Update text and stylistic metrics
      this.currentQuestionSpan.textContent = this.quizState.index + 1;
      this.progressBar.style.width = `${this.quizState.getProgressPercentage()}%`;
      this.questionText.textContent = currentQuestion.question;

      // Purge the previous answer nodes to prevent ghost elements and ensure a clean DOM slate
      this.answersContainer.innerHTML = "";

      // Dynamically reconstruct the answer nodes for the active state
      currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.textContent = answer.text;
        button.classList.add("answer-btn");
        
        // Map the boolean correctness to a string dataset property for easy DOM evaluation later
        button.dataset.correct = answer.correct;

        // Attach a scoped listener to each dynamically generated node
        button.addEventListener("click", (event) => this.selectAnswer(event));
        this.answersContainer.appendChild(button);
      });
    }

    // ==========================================
    // --- EVALUATION & STATE MUTATION        ---
    // ==========================================

    /**
     * Handles user selection, applies visual feedback, and defers navigation.
     * @param {Event} event - The button click event object.
     */
    selectAnswer(event) {
      // Enforce the interaction lock immediately. This drops execution if a user double-clicks, 
      // preventing race conditions or double-scoring on a single question.
      if (this.quizState.disabled) return;

      const selectedButton = event.target;
      const isCorrect = selectedButton.dataset.correct === "true";

      // Traverse the child nodes to paint the visual feedback state across all options simultaneously
      Array.from(this.answersContainer.children).forEach((button) => {
        button.classList.add(button.dataset.correct === "true" ? "correct" : "incorrect");
      });

      // Pass the evaluated truthiness back to the data layer for scoring
      this.quizState.evaluateAnswer(isCorrect);
      
      // Paint the updated score synchronously
      this.scoreSpan.textContent = this.quizState.score;

      // Defer state progression. This keeps the current view locked for 3 seconds 
      // so the user can process the visual feedback before the DOM repaints.
      setTimeout(() => {
        // Increment the data pointer
        this.quizState.advanceQuestion();

        // Branch the execution path based on the dataset boundaries
        if (this.quizState.isQuizOver()) {
          this.showResults();
        } else {
          this.showQuestion();
        }
      }, 3000);
    }

    // ==========================================
    // --- TERMINAL STATE & RESETS            ---
    // ==========================================

    /**
     * Reveals the results view and updates final performance metrics.
     */
    showResults() {
      // Execute final SPA screen routing
      this.quizScreen.classList.remove("active");
      this.resultScreen.classList.add("active");

      // Pull the raw integer score
      this.finalScoreSpan.textContent = this.quizState.score;
      
      // Pull the computed percentage to determine the tier
      const percentage = this.quizState.getGradePercentage();

      // Top-down threshold evaluation. This pattern decouples the grading logic from 
      // the total question count, allowing the dataset size to change without breaking the tier system.
      if (percentage >= 100) {
        this.resultMessage.textContent = "Perfect Score!";
      } else if (percentage >= 80) {
        this.resultMessage.textContent = "Great Job!";
      } else if (percentage >= 60) {
        this.resultMessage.textContent = "Good Effort!";
      } else if (percentage >= 40) {
        this.resultMessage.textContent = "Not bad!";
      } else {
        this.resultMessage.textContent = "Needs Improvement!";
      }
    }

    /**
     * Resets screen routing and restarts the quiz session.
     */
    restartQuiz() {
      // Hide the final view and delegate the heavy reset logic back to the start controller
      this.resultScreen.classList.remove("active");
      this.startQuiz();
    }
}