import { getTxtTemplate, getJsonTemplate } from "../utils/templates.js";
import { confirmAction } from "../utils/prompts.js";
import { exportQAD } from "../utils/fileIO.js";
import { parseAndValidateRawText } from "../utils/schemaValidator.js";
import { createLogger } from "../utils/logger.js";

/**
 * UI controller coordinating the advanced text editor interface.
 * Maps UI actions (parse, clear, templates) to routing and payload mutations.
 *
 * @class EditorUIController
 * @name EditorUIController
 * @version 1.5.2
 * @author Adam Ross DeStafeno
 * @property {QuizUIControllerType} quizUIController - Controller for launching quiz previews.
 * @property {AppNavigationControllerType} appNavController - Controller for screen transitions.
 * @property {HTMLTextAreaElement} editorTextarea - DOM input for raw question payloads.
 * @property {HTMLElement} editorStatus - DOM element for displaying parser errors.
 * @typedef {import('../types.js').QuizUIControllerType} QuizUIControllerType
 * @typedef {import('../types.js').AppNavigationControllerType} AppNavigationControllerType
 * @typedef {import('../types.js').QuestionType} QuestionType
 */
export default class EditorUIController {
  /**
   * Initializes the advanced editor DOM bindings and event listeners.
   * @name constructor
   * @public
   * @param {QuizUIControllerType} quizUIController - Exposed for direct bypass assessment triggers explicitly.
   * @param {AppNavigationControllerType} appNavController - Coordinates manual routing assignments optimally.
   * @throws {Error} If the editor-textarea element is not found or not a textarea.
   */
  constructor(quizUIController, appNavController) {
    this.logger = createLogger("EditorUIController");
    this.logger.info("constructor called", {
      quizUIController,
      appNavController
    });

    this.quizUIController = quizUIController;
    this.appNavController = appNavController;

    const editorTextareaEl = this.getEl("editor-textarea");
    if (!(editorTextareaEl instanceof HTMLTextAreaElement)) {
      throw new Error("editor-textarea element not found or not a textarea");
    }
    this.editorTextarea = editorTextareaEl;
    this.editorStatus = this.getEl("editor-status");

    this.logger.info("Editor UI controller initialized");

    this.initializeEventListeners();
  }

  /**
   * Safely retrieves a DOM element by ID.
   * @param {string} id - The DOM element ID.
   * @returns {HTMLElement} - The resolved DOM node.
   * @throws {Error} - If the DOM node is not found.
   */
  getEl(id) {
    const el = document.getElementById(id);
    if (!(el instanceof HTMLElement))
      throw new Error(`Missing DOM node: ${id}`);
    return el;
  }

  /**
   * Hooks physical actions to editor operations cleanly.
   * @name initializeEventListeners
   * @public
   * @returns {void}
   */
  initializeEventListeners() {
    this.logger.info("initializeEventListeners called");

    this.getEl("btn-editor-template-txt").addEventListener("click", () => {
      this.logger.info("initializeEventListeners: onTemplateTxtClick event");
      if (this.editorTextarea.value.trim() !== "") {
        if (
          !confirmAction(
            "Inserting this template will overwrite your current text. Do you wish to continue?"
          )
        ) {
          return;
        }
      }
      this.logger.info("Text template inserted into editor field");
      this.editorTextarea.value = getTxtTemplate();
    });

    this.getEl("btn-editor-template-json").addEventListener("click", () => {
      this.logger.info("initializeEventListeners: onTemplateJsonClick event");
      if (this.editorTextarea.value.trim() !== "") {
        if (
          !confirmAction(
            "Inserting this template will overwrite your current text. Do you wish to continue?"
          )
        ) {
          return;
        }
      }
      this.logger.info("JSON template inserted into editor field");
      this.editorTextarea.value = getJsonTemplate();
    });

    this.getEl("btn-editor-clear").addEventListener("click", () => {
      this.logger.info("initializeEventListeners: onClearEditorClick event");
      if (this.editorTextarea.value.trim() === "") return;
      if (
        confirmAction(
          "Are you sure you want to clear the editor? This action cannot be undone."
        )
      ) {
        this.editorTextarea.value = "";
        this.editorStatus.textContent = "";
        this.editorStatus.className = "file-status";
        this.logger.debug("Editor content cleared");
      }
    });

    this.getEl("btn-editor-cancel").addEventListener("click", () => {
      this.logger.info("initializeEventListeners: onCancelEditorClick event");
      this.appNavController.navigateTo("start");
    });

    this.getEl("btn-editor-parse").addEventListener("click", () => {
      this.logger.info("initializeEventListeners: onParseEditorClick event");
      this.parseEditorData();
    });

    this.getEl("btn-editor-export").addEventListener("click", () => {
      this.logger.info("initializeEventListeners: onExportEditorClick event");
      this.exportEditorData();
    });
  }

  /**
   * Parses the raw text payload in the editor and launches the quiz preview if valid.
   * @name parseEditorData
   * @public
   * @returns {void}
   */
  parseEditorData() {
    this.logger.info("parseEditorData called");
    const rawData = this.editorTextarea.value.trim();
    if (!rawData) {
      this.editorStatus.textContent = "Please provide data to parse.";
      this.editorStatus.className = "file-status file-error";
      this.logger.warn("Parse attempt failed: empty payload");
      return;
    }

    try {
      this.editorStatus.textContent = "Parsing data...";
      this.editorStatus.className = "file-status file-success";
      this.logger.debug("Executing raw payload schema validation natively");

      const parsedQuestions = parseAndValidateRawText(rawData);

      this.logger.info("Raw payload validated securely", {
        questionsParsed: parsedQuestions.length
      });

      this.quizUIController.loadCustomQuiz(parsedQuestions, true);

      this.editorStatus.textContent = "";
      this.editorStatus.className = "file-status";
    } catch (/** @type {any} */ err) {
      this.logger.warn("Payload validation rejected", {
        message: err.message
      });
      this.editorStatus.textContent = `Error: ${err.message}`;
      this.editorStatus.className = "file-status file-error";
    }
  }

  /**
   * Exports the raw text payload to a downloadable file.
   * Automatically attempts to determine format context via parsing.
   * @name exportEditorData
   * @public
   * @returns {void}
   */
  exportEditorData() {
    this.logger.info("exportEditorData called");
    const rawData = this.editorTextarea.value.trim();
    if (!rawData) {
      this.editorStatus.textContent = "No data to export.";
      this.editorStatus.className = "file-status file-error";
      this.logger.warn("Export attempt failed: empty payload");
      return;
    }

    try {
      // Validate first to ensure we export a structured payload
      const parsedQuestions = parseAndValidateRawText(rawData);
      exportQAD(parsedQuestions);
      this.logger.info("Editor payload exported successfully");
    } catch (/** @type {any} */ err) {
      this.logger.warn("Export validation rejected", {
        message: err.message
      });
      this.editorStatus.textContent = `Error: Cannot export invalid data. ${err.message}`;
      this.editorStatus.className = "file-status file-error";
    }
  }
}
