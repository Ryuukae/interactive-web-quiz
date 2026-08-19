// ===============================
// --- APPLICATION ENTRY POINT ---
// ===============================

import AppNavigationController from "./controllers/AppNavigationController.js";
import QuizState from "./models/QuizState.js";
import BuilderState from "./models/BuilderState.js";
import QuizUIController from "./controllers/QuizUIController.js";
import BuilderUIController from "./controllers/BuilderUIController.js";
import EditorUIController from "./controllers/EditorUIController.js";
import { createLogger } from "./utils/logger.js";

/**
 * Application Entry Point.
 * Serves as the composition root, orchestrating state instantiation and controller initialization.
 *
 * @module script
 * @version 1.5.2
 * @author Adam Ross DeStafeno
 */

let appNavController;
let quizState;
let builderState;
let quizUIController;

const logger = createLogger("AppBootstrap");

/**
 * Orchestrates the asynchronous bootstrap sequence systematically. Enforces a strict initialization pipeline natively: State Models -> Controllers sequentially.
 * @name initializeApp
 * @public
 * @returns {Promise<void>} - Resolves when bootstrap completes.
 */
async function initializeApp() {
  logger.info("initializeApp called");
  try {
    logger.info("Application bootstrap started");

    /* Orchestrates the root instantiation chain strictly, enforcing dependency injection natively and cleanly. */
    // ----------------------------------------------------------------------
    logger.debug("Instantiating AppNavigationController");
    appNavController = new AppNavigationController();

    // Initializes the state machine with an empty baseline array pending user import or creation.
    logger.debug("Instantiating QuizState and BuilderState models");
    quizState = new QuizState([]);
    builderState = new BuilderState();

    logger.debug("Instantiating UI controllers");
    quizUIController = new QuizUIController(quizState, appNavController);
    new BuilderUIController(builderState, quizUIController, appNavController);
    new EditorUIController(quizUIController, appNavController);

    logger.debug("Synchronizing initial quiz UI bounds");
    quizUIController.synchronizeBounds();
    // ----------------------------------------------------------------------

    logger.debug("Application services instantiated successfully", {
      screens: ["start", "quiz", "result", "creator", "editor"],
      questionCount: quizState.questionData.length,
      builderCardCount: builderState.cards.length
    });

    logger.info("Application bootstrap completed successfully");
  } catch (error) {
    logger.error("Application bootstrap failed", error);
  }
}

initializeApp();
