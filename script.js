/**
 * DOM Element References
 * Cached once at the global scope to prevent repeated DOM querying overhead
 * during component re-renders and UI updates.
 */
const startScreen = document.getElementById("start-screen");
const quizScreen = document.getElementById("quiz-screen");
const resultScreen = document.getElementById("result-screen");
const startButton = document.getElementById("start-btn");
const questionText = document.getElementById("question-text");
const answersContainer = document.getElementById("answers-container");
const currentQuestionSpan = document.getElementById("current-question");
const totalQuestionsSpan = document.getElementById("totalQuestionsSpan");
const scoreSpan = document.getElementById("score");
const finalScoreSpan = document.getElementById("final-score");
const maxScoreSpan = document.getElementById("max-score");
const resultMessage = document.getElementById("result-message");
const restartButton = document.getElementById("restart-btn");
const progressBar = document.getElementById("progress");

/**
 * Global reference to the application's state manager.
 * Declared at the root scope to allow UI controller functions 
 * to interface with the business logic.
 * @type {QuizState}
 */
let quizState;

/**
 * Asynchronously retrieves and parses the quiz dataset from the local network.
 * 
 * @returns {Promise<Array<Object>>} A promise resolving to the parsed array of question objects.
 */
async function fetchQuizContent() {
  const response = await fetch('questions.json');
  return response.json();
}

/**
 * Bootstraps the application on initial script load.
 * Handles the asynchronous data fetching phase, hydrates the global state manager, 
 * and performs the initial DOM synchronization.
 * 
 * Note: This mutates the global `quizState` variable and updates initial UI metrics.
 */
async function initializeApp() {
  try {
    // Await the asynchronous network request before proceeding
    const questionData = await fetchQuizContent();
             
    // Hydrate the state manager with the retrieved dataset
    quizState = new QuizState(questionData);
    
    // Synchronize the DOM with the newly loaded total question count
    totalQuestionsSpan.textContent = quizState.questionData.length;
    maxScoreSpan.textContent = quizState.questionData.length;
             
    // The data layer is now ready; the UI can safely interact with quizState
    console.log("Quiz initialized successfully with dataset:", quizState.questionData);
  } catch (error) {
    // Failsafe in case the JSON file is missing or contains syntax errors
    console.error("Failed to initialize the quiz application data layer:", error);
  }
}

// Execute the bootstrap sequence immediately
initializeApp();

// ------------------------------------------------------------------------------

// Event Delegation
startButton.addEventListener("click", startQuiz);
restartButton.addEventListener("click", restartQuiz);

/**
 * Initiates a new quiz session.
 * Resets internal state metrics, synchronizes the initial score to the DOM, 
 * and manages the CSS class transitions to reveal the active quiz interface.
 */
function startQuiz() {
  // Reset core logic state
  quizState.resetQuiz();
  
  // Synchronize score value
  scoreSpan.textContent = quizState.score;

  // Swap the visible screens by toggling the "active" CSS layout classes
  startScreen.classList.remove("active");
  quizScreen.classList.add("active");

  showQuestion();
}

/**
 * Renders the active question and dynamically generates its associated answer buttons.
 * Synchronizes progression metrics (progress bar width, counter text) with the DOM.
 * 
 * Note: This clears and mutates the `answersContainer` innerHTML on every invocation.
 */
function showQuestion() {
  // Re-enable interaction for the new UI state
  quizState.resetClickLock();
  
  // Fetch the current question data object from the state manager
  const currentQuestion = quizState.getCurrentQuestion();

  // Update UI progression text (e.g., "Question 1")
  currentQuestionSpan.textContent = quizState.index + 1;

  // Calculate and apply the progress bar width dynamically
  const progressPercent = quizState.getProgressPercentage();
  progressBar.style.width = `${progressPercent}%`;
  
  // Inject the question text into the DOM
  questionText.textContent = currentQuestion.question;
  
  // Clear out legacy DOM nodes from the previous question
  answersContainer.innerHTML = "";

  // Generate fresh answer buttons and append them to the container
  currentQuestion.answers.forEach(answer => {
    const button = document.createElement("button");
    button.textContent = answer.text;
    button.classList.add("answer-btn");

    // Standardize boolean to a string format ("true" or "false") for HTML dataset rules
    button.dataset.correct = answer.correct;

    // Attach the evaluation logic to the node's click event
    button.addEventListener("click", selectAnswer);

    answersContainer.appendChild(button);
  });
}

/**
 * Event handler for answer selection.
 * Evaluates the chosen answer, applies immediate visual feedback to all options, 
 * and defers state progression via a timeout to allow for user cognitive processing.
 * 
 * @param {Event} event - The click event object triggered by the selected answer button.
 */
function selectAnswer(event) {
  // Prevent duplicate submissions and event bubbling during the transition delay
  if (quizState.disabled) return;
  
  const selectedButton = event.target;
  const isCorrect = selectedButton.dataset.correct === "true";

  // Expose correct/incorrect visual states across all available option nodes
  Array.from(answersContainer.children).forEach((button) => {
    button.classList.add(button.dataset.correct === "true" ? "correct" : "incorrect");
  });

  quizState.evaluateAnswer(isCorrect);
  scoreSpan.textContent = quizState.score;

  // Defer progression routing to allow the user to process the visual outcome
  setTimeout(() => {
    quizState.advanceQuestion();

    // Standard state routing: show results if dataset is exhausted, else render next question
    if (quizState.isQuizOver()) {
      showResults();
    } else {
      showQuestion();
    }
  }, 1000);
}

/**
 * Evaluates final performance and transitions the UI to the results screen.
 * Utilizes a top-down threshold evaluation to dynamically assign feedback tiers 
 * independently of the underlying dataset length.
 */
function showResults() {
  // Swap visibility states to reveal the final results container
  quizScreen.classList.remove("active");
  resultScreen.classList.add("active");

  // Inject the raw score integer from the state manager
  finalScoreSpan.textContent = quizState.score;

  // Fetch the calculated grade percentage directly from the state manager
  const percentage = quizState.getGradePercentage();

  // Top-down threshold evaluation allows scalable tier assignment
  if (percentage >= 100) {
    resultMessage.textContent = "Perfect Score!";
  } else if (percentage >= 80) {
    resultMessage.textContent = "Great Job!";
  } else if (percentage >= 60) {
    resultMessage.textContent = "Good Effort!";
  } else if (percentage >= 40) {
    resultMessage.textContent = "Not bad!";
  } else {
    resultMessage.textContent = "Needs Improvement!";
  }
}

/**
 * Resets the UI routing from the results screen back to the active quiz interface.
 * Delegates the actual data and score reset logic to the `startQuiz` controller.
 */
function restartQuiz() {
  console.log("quiz restarted");
  
  // Hide the results screen and trigger the start flow again
  resultScreen.classList.remove("active");
  startQuiz();
}