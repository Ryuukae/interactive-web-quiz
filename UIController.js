/**
 * UIController Class
 * Encapsulates all DOM element caching, event listener bindings, 
 * and UI rendering operations for the interactive quiz application.
 */
class UIController {
    /**
     * Instantiates the controller, caches DOM references, and sets up event delegation.
     * @param {QuizState} quizState - The active instance of the state manager.
     */
    constructor(quizState) {
      // 1. Bind state instance
      this.quizState = quizState;
  
      // 2. Cache DOM Elements
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
  
      // 3. Bind event listeners
      this.initializeEventListeners();
    }
  
    /**
     * Binds click events to static buttons.
     * Uses arrow functions to preserve the class scope (`this`).
     */
    initializeEventListeners() {
      this.startButton.addEventListener("click", () => this.startQuiz());
      this.restartButton.addEventListener("click", () => this.restartQuiz());
    }
  
    /**
     * Synchronizes static UI bounds with the loaded dataset length.
     */
    synchronizeBounds() {
      const totalCount = this.quizState.questionData.length;
      this.totalQuestionsSpan.textContent = totalCount;
      this.maxScoreSpan.textContent = totalCount;
    }
  
    /**
     * Starts a new quiz session and reveals the active screen.
     */
    startQuiz() {
      this.quizState.resetQuiz();
      this.scoreSpan.textContent = this.quizState.score;
  
      this.startScreen.classList.remove("active");
      this.quizScreen.classList.add("active");
  
      this.showQuestion();
    }
  
    /**
     * Renders the current question and dynamically generates answer choices.
     */
    showQuestion() {
      this.quizState.resetClickLock();
      const currentQuestion = this.quizState.getCurrentQuestion();
  
      this.currentQuestionSpan.textContent = this.quizState.index + 1;
      this.progressBar.style.width = `${this.quizState.getProgressPercentage()}%`;
      this.questionText.textContent = currentQuestion.question;
  
      this.answersContainer.innerHTML = "";
  
      currentQuestion.answers.forEach(answer => {
        const button = document.createElement("button");
        button.textContent = answer.text;
        button.classList.add("answer-btn");
        button.dataset.correct = answer.correct;
  
        // Event handler bound to the class instance
        button.addEventListener("click", (event) => this.selectAnswer(event));
  
        this.answersContainer.appendChild(button);
      });
    }
  
    /**
     * Handles user selection, applies visual feedback, and defers navigation.
     * @param {Event} event - The button click event object.
     */
    selectAnswer(event) {
      if (this.quizState.disabled) return;
  
      const selectedButton = event.target;
      const isCorrect = selectedButton.dataset.correct === "true";
  
      Array.from(this.answersContainer.children).forEach((button) => {
        button.classList.add(button.dataset.correct === "true" ? "correct" : "incorrect");
      });
  
      this.quizState.evaluateAnswer(isCorrect);
      this.scoreSpan.textContent = this.quizState.score;
  
      setTimeout(() => {
        this.quizState.advanceQuestion();
  
        if (this.quizState.isQuizOver()) {
          this.showResults();
        } else {
          this.showQuestion();
        }
      }, 1000);
    }
  
    /**
     * Reveals the results view and updates final performance metrics.
     */
    showResults() {
      this.quizScreen.classList.remove("active");
      this.resultScreen.classList.add("active");
  
      this.finalScoreSpan.textContent = this.quizState.score;
      const percentage = this.quizState.getGradePercentage();
  
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
      this.resultScreen.classList.remove("active");
      this.startQuiz();
    }
  }