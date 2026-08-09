// ===============================
// --- APPLICATION ENTRY POINT ---
// ===============================

import AppNavigationController from './controllers/AppNavigationController.js';
import QuizState from './models/QuizState.js';
import BuilderState from './models/BuilderState.js';
import QuizUIController from './controllers/QuizUIController.js';
import BuilderUIController from './controllers/BuilderUIController.js';

/**
 * @module script
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
 * @description 
 * Architectural Responsibilities: Application Entry Point. Orchestrates state instantiation and controller initialization.
 * 
 * Encapsulation Scope: Serves as the composition root where dependencies are physically wired together correctly.
 */

let appNavController;
let quizState;
let builderState;
let quizUIController;
let builderUIController;

/**
 * @name initializeApp
 * @public
 * @description Orchestrates the asynchronous bootstrap sequence systematically. Enforces a strict initialization pipeline natively: State Models -> Controllers sequentially.
 * @returns {void} - Does not return a value.
 */
async function initializeApp() {
    try {
        /* Orchestrates the root instantiation chain strictly, enforcing dependency injection natively and cleanly. */
        // ----------------------------------------------------------------------
        appNavController = new AppNavigationController();
        
        // Initializes the state machine with an empty baseline array pending user import or creation.
        quizState = new QuizState([]);
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