/**
 * Centralized type definitions for the interactive web quiz application.
 * @module types
 * @version 1.5.2
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
 * Type definition for a distractor option object.
 * @typedef {object} DistractorObject
 * @property {string} text - The distractor text.
 */

/**
 * Type definition for raw question payload structure (e.g. QAD format prefill data).
 * @typedef {object} RawQuestionType
 * @property {string} question - The question text.
 * @property {string} [correct_answer] - The correct answer string.
 * @property {Array<DistractorObject | string>} [distractors] - The array of distractor options.
 * @property {AnswerType[]} [answers] - Alternate array of choices.
 */

/**
 * Union type for question data supplied to builder card components and export utilities.
 * @typedef {QuestionType | RawQuestionType} BuilderCardPrefillType
 */

/**
 * @typedef {"start" | "creator" | "editor" | "quiz" | "result"} ScreenKey
 */

/**
 * @typedef {"trace"|"debug"|"info"|"warn"|"error"|"silent"} LogLevel
 */

/**
 * Interface definition for a scoped logger instance.
 * @typedef {object} LoggerInstance
 * @property {(message: string, details?: any) => void} trace - Emits a trace log.
 * @property {(message: string, details?: any) => void} debug - Emits a debug log.
 * @property {(message: string, details?: any) => void} info - Emits an info log.
 * @property {(message: string, details?: any) => void} warn - Emits a warn log.
 * @property {(message: string, details?: any) => void} error - Emits an error log.
 * @property {(childScope: string) => LoggerInstance} child - Spawns a child logger.
 */

/**
 * Union of all modal element IDs present in the application.
 * @typedef {"creation-mode-modal" | "modal-guide-txt" | "modal-guide-json" | "modal-focus-edit" | "modal-focus-editor"} ModalId
 */

/**
 * Staged file upload data structure for modification.
 * @typedef {object} ModifyQuizPayloadType
 * @property {BuilderCardPrefillType[]} parsedQuestions - Array of parsed question objects ready for builder ingestion.
 * @property {string} rawText - The unparsed source text content for the text editor.
 * @property {string} fileName - The name of the ingested source file.
 */

/**
 * @typedef {import('./models/QuizState.js').default} QuizStateType
 * @typedef {import('./models/BuilderState.js').default} BuilderStateType
 * @typedef {import('./controllers/AppNavigationController.js').default} AppNavigationControllerType
 * @typedef {import('./controllers/StartUIController.js').default} StartUIControllerType
 * @typedef {import('./controllers/QuizUIController.js').default} QuizUIControllerType
 * @typedef {import('./controllers/BuilderUIController.js').default} BuilderUIControllerType
 * @typedef {import('./controllers/EditorUIController.js').default} EditorUIControllerType
 * @typedef {import('./components/BuilderCardComponent.js').default} BuilderCardComponentType
 * @typedef {import('./components/QuestionFocusModalComponent.js').default} QuestionFocusModalComponentType
 * @typedef {import('./components/FullscreenEditorModalComponent.js').default} FullscreenEditorModalComponentType
 * @typedef {import('./utils/logger.js').default} LoggerType
 * @typedef {import('./utils/StorageService.js').default} StorageServiceType
 */

export {};
