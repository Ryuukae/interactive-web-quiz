/**
 * Application Entry Point
 * Orchestrates dataset retrieval, state instantiation, and controller initialization.
 * Serves as the composition root where the application's dependencies are wired together.
 */

// Declared at the module scope to maintain persistent references to the root instances. 
// This prevents aggressive memory garbage collection and allows for runtime inspection in the browser console.
let quizState;
let uiController;

/**
 * Isolates the network I/O boundary.
 * 
 * @returns {Promise<Array<Object>>} A promise that resolves to the parsed JSON payload.
 */
async function fetchQuizContent() {
  // Suspend execution until the network request resolves. 
  // This strict await pattern prevents asynchronous race conditions where the application 
  // might attempt to render the View layer before the underlying Data layer actually exists.
  const response = await fetch('questions.json');
  
  // Parse the raw stream and return it as native JavaScript object structures
  return response.json();
}

/**
 * Orchestrates the asynchronous bootstrap sequence.
 * Enforces a strict initialization pipeline: Network -> Data Model -> View Controller.
 */
async function initializeApp() {
  try {
    // Fetch Phase: Await the raw dataset from the external environment
    const questionData = await fetchQuizContent();

    // State Hydration Phase: Instantiate the Model
    // The state machine must be initialized first to establish the application's definitive source of truth.
    quizState = new QuizState(questionData);

    // View Initialization Phase: Instantiate the Controller
    // We utilize Dependency Injection here by passing the hydrated QuizState directly into the UIController.
    // This allows the View layer to read and mutate the data without relying on hardcoded global couplings.
    uiController = new UIController(quizState);
    
    // Synchronization Phase: Align the UI with the Model
    // Ensure static DOM elements reflect the mathematical bounds of the newly loaded dataset 
    // before the user is allowed to begin interacting with the application.
    uiController.synchronizeBounds();

    console.log("App successfully initialized.");
  } catch (error) {
    // Graceful failsafe to handle network timeouts, missing local files, or malformed JSON payloads.
    // In a mature production environment, this catch block would actively mount a fallback error UI.
    console.error("Failed to initialize the application data layer:", error);
  }
}

// Trigger the asynchronous bootstrap lifecycle immediately upon script evaluation
initializeApp();