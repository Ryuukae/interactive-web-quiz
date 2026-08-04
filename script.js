/**
 * Application Entry Point
 * Orchestrates dataset retrieval, state instantiation, and controller initialization.
 */
let quizState;
let uiController;

async function fetchQuizContent() {
  const response = await fetch('questions.json');
  return response.json();
}

async function initializeApp() {
  try {
    const questionData = await fetchQuizContent();

    // Instantiate State Manager (Model/Controller)
    quizState = new QuizState(questionData);

    // Instantiate UI Controller (View)
    uiController = new UIController(quizState);
    uiController.synchronizeBounds();

    console.log("App successfully initialized.");
  } catch (error) {
    console.error("Failed to initialize the application:", error);
  }
}

// Bootstrap
initializeApp();