/**
 * Centralized type definitions for the interactive web quiz application.
 * @module types
 * @version 1.5.1
 * @author Adam Ross DeStafeno
 */

/**
 * Type definition for a single quiz answer.
 * @typedef {object} AnswerType
 * @property {string} text - The answer text.
 * @property {boolean} correct - Indicates if the answer is correct.
 */

/**
 * Type definition for a quiz question structure.
 * @typedef {object} QuestionType
 * @property {string} question - The question text.
 * @property {AnswerType[]} answers - Array of possible answers.
 */

/**
 * @typedef {"start" | "creator" | "quiz" | "result"} ScreenKey
 */

/**
 * @typedef {"trace"|"debug"|"info"|"warn"|"error"|"silent"} LogLevel
 */

/**
 * @typedef {import('./models/QuizState.js').default} QuizStateType
 * @typedef {import('./models/BuilderState.js').default} BuilderStateType
 * @typedef {import('./controllers/AppNavigationController.js').default} AppNavigationControllerType
 * @typedef {import('./controllers/QuizUIController.js').default} QuizUIControllerType
 * @typedef {import('./components/BuilderCardComponent.js').default} BuilderCardComponentType
 */

export {};
