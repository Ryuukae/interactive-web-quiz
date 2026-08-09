// ===============================
// --- APPLICATION ENTRY POINT ---
// ===============================

/**
 * @module script
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
 * @description 
 * Architectural Responsibilities: Application Entry Point. Orchestrates dataset retrieval, state instantiation, and controller initialization.
 * 
 * Encapsulation Scope: Serves as the composition root where dependencies are physically wired together correctly.
 */

// Declared at the module scope to maintain persistent references to the root instances. 
// This prevents aggressive memory garbage collection and allows for runtime inspection in the browser console.
let appNavController;
let quizState;
let builderState;
let quizUIController;
let builderUIController;

/**
 * @name fetchQuizContent
 * @public
 * @description Isolates the network I/O boundary securely natively.
 * @returns {Promise<Array<Object>>} - A promise that resolves to the parsed JSON payload natively.
 */
async function fetchQuizContent() {
    const response = await fetch('questions.json');
    return response.json();
}

/**
 * @name initializeApp
 * @public
 * @description Orchestrates the asynchronous bootstrap sequence systematically. Enforces a strict initialization pipeline natively: Network -> State Models -> Controllers sequentially.
 * @returns {void} - Does not return a value.
 */
async function initializeApp() {
    try {
        /* Orchestrates the root instantiation chain strictly, enforcing dependency injection natively and cleanly. */
        // ----------------------------------------------------------------------
        appNavController = new AppNavigationController();
        
        const questionData = await fetchQuizContent();
        
        quizState = new QuizState(questionData);
        builderState = new BuilderState();
        
        quizUIController = new QuizUIController(quizState, appNavController);
        builderUIController = new BuilderUIController(builderState, quizUIController, appNavController);
        
        quizUIController.synchronizeBounds();
        // ----------------------------------------------------------------------

        console.log("App successfully initialized via strict MVC protocols.");

    } catch (error) {
        console.error("Failed to initialize the application logic tier:", error);
    }
}

initializeApp();