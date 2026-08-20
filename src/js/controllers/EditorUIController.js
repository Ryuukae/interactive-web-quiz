import { getTxtTemplate, getJsonTemplate } from "../utils/templates.js";
import { confirmAction } from "../utils/prompts.js";
import { exportQAD, readFile } from "../utils/fileIO.js";
import { parseAndValidateRawText } from "../utils/schemaValidator.js";
import FullscreenEditorModalComponent from "../components/FullscreenEditorModalComponent.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("EditorUIController");

/**
 * UI controller coordinating the advanced text editor interface.
 * Maps UI actions (parse, clear, templates) to routing and payload mutations.
 *
 * @class EditorUIController
 * @name EditorUIController
 * @version 1.6.2
 * @author Adam Ross DeStafeno
 * @property {QuizUIControllerType} quizUIController - Controller for launching quiz previews.
 * @property {AppNavigationControllerType} appNavController - Controller for screen transitions.
 * @property {HTMLTextAreaElement} editorTextarea - DOM input for raw question payloads.
 * @property {HTMLElement} editorStatus - DOM element for displaying parser errors.
 * @property {FullscreenEditorModalComponent} fullscreenModal - Controller for the expanded workstation.
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
    logger.info("constructor called");
    logger.debug("Initializing EditorUIController dependencies", {
      hasQuizUI: Boolean(quizUIController),
      hasAppNav: Boolean(appNavController)
    });

    this.quizUIController = quizUIController;
    this.appNavController = appNavController;

    const editorTextareaEl = this.getEl("editor-textarea");
    if (!(editorTextareaEl instanceof HTMLTextAreaElement)) {
      throw new Error("editor-textarea element not found or not a textarea");
    }
    this.editorTextarea = editorTextareaEl;
    this.editorStatus = this.getEl("editor-status");

    this.fullscreenModal = new FullscreenEditorModalComponent(appNavController);

    logger.info("Editor UI controller initialized");
    logger.debug("Editor UI controller ready for user interaction");

    this.initializeEventListeners();
  }

  /**
   * Safely retrieves a DOM element by ID.
   * @param {string} id - The DOM element ID.
   * @returns {HTMLElement} - The resolved DOM node.
   * @throws {Error} - If the DOM node is not found.
   */
  getEl(id) {
    logger.debug("getEl called", { id });
    const el = document.getElementById(id);
    if (!(el instanceof HTMLElement))
      throw new Error(`Missing DOM node: ${id}`);
    return el;
  }

  /**
   * Checks whether the editor textarea currently contains non-empty text.
   * @returns {boolean} True if the textarea has non-empty content, false otherwise.
   */
  hasExistingData() {
    logger.info("hasExistingData called");
    const hasData = Boolean(
      this.editorTextarea && this.editorTextarea.value.trim() !== ""
    );
    logger.debug("Evaluated editor text existence", { hasData });
    return hasData;
  }

  /**
   * Hooks physical actions to editor operations cleanly.
   * @name initializeEventListeners
   * @public
   * @returns {void}
   */
  initializeEventListeners() {
    logger.info("initializeEventListeners called");
    logger.debug("Binding text editor button listeners");

    this.getEl("btn-editor-template-txt").addEventListener("click", () => {
      logger.info("initializeEventListeners: onTemplateTxtClick event");
      logger.debug("Injecting QAD TXT template into editor");
      if (this.editorTextarea.value.trim() !== "") {
        if (
          !confirmAction(
            "Inserting this template will overwrite your current text. Do you wish to continue?"
          )
        ) {
          logger.debug("TXT template insert cancelled by user");
          return;
        }
      }
      this.editorTextarea.value = getTxtTemplate();
    });

    this.getEl("btn-editor-template-json").addEventListener("click", () => {
      logger.info("initializeEventListeners: onTemplateJsonClick event");
      logger.debug("Injecting JSON template into editor");
      if (this.editorTextarea.value.trim() !== "") {
        if (
          !confirmAction(
            "Inserting this template will overwrite your current text. Do you wish to continue?"
          )
        ) {
          logger.debug("JSON template insert cancelled by user");
          return;
        }
      }
      this.editorTextarea.value = getJsonTemplate();
    });

    const importInput = document.getElementById("input-editor-import-file");
    if (importInput) {
      importInput.addEventListener("change", async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement) || !target.files?.[0]) return;
        const file = target.files[0];
        logger.debug("Processing file import in text editor", {
          fileName: file.name,
          size: file.size
        });

        if (this.editorTextarea.value.trim() !== "") {
          if (
            !confirmAction(
              "Importing this file will overwrite your current text. Do you wish to continue?"
            )
          ) {
            logger.debug("File import cancelled by user");
            target.value = "";
            return;
          }
        }

        try {
          const content = await readFile(file);
          this.editorTextarea.value = content;
          logger.info("File imported into editor field", {
            fileName: file.name
          });
          logger.debug("Editor content populated from imported file", {
            characterCount: content.length
          });
        } catch (err) {
          logger.error("Failed to read imported file", err);
        } finally {
          target.value = "";
        }
      });
    }

    this.getEl("btn-editor-clear").addEventListener("click", () => {
      logger.info("initializeEventListeners: onClearEditorClick event");
      if (this.editorTextarea.value.trim() === "") return;
      if (
        confirmAction(
          "Are you sure you want to clear the editor? This action cannot be undone."
        )
      ) {
        this.editorTextarea.value = "";
        this.editorStatus.textContent = "";
        this.editorStatus.className = "file-status";
        logger.info("Editor content cleared");
        logger.debug("Text editor textarea and status reset");
      }
    });

    this.getEl("btn-editor-cancel").addEventListener("click", () => {
      logger.info("initializeEventListeners: onCancelEditorClick event");
      logger.debug("Navigating back to start screen from editor");
      this.appNavController.navigateTo("start");
    });

    this.getEl("btn-editor-parse").addEventListener("click", () => {
      logger.info("initializeEventListeners: onParseEditorClick event");
      logger.debug("Triggering parseEditorData from parse button");
      this.parseEditorData();
    });

    this.getEl("btn-editor-export").addEventListener("click", () => {
      logger.info("initializeEventListeners: onExportEditorClick event");
      logger.debug("Triggering exportEditorData from export button");
      this.exportEditorData();
    });

    const expandBtn = document.getElementById("btn-focus-editor-expand");
    if (expandBtn) {
      expandBtn.addEventListener("click", () => {
        logger.info("initializeEventListeners: onExpandFocusEditorClick event");
        logger.debug("Opening fullscreen focus modal from text editor");
        this.fullscreenModal.open(this.editorTextarea.value, (newText) => {
          this.editorTextarea.value = newText;
        });
      });
    }
  }

  /**
   * Parses the raw text payload in the editor and launches the quiz preview if valid.
   * @name parseEditorData
   * @public
   * @returns {void}
   */
  parseEditorData() {
    logger.info("parseEditorData called");
    const rawData = this.editorTextarea.value.trim();
    logger.debug("Evaluating editor textarea payload", {
      length: rawData.length
    });
    if (!rawData) {
      this.editorStatus.textContent = "Please provide data to parse.";
      this.editorStatus.className = "file-status file-error";
      logger.warn("Parse attempt failed: empty payload");
      return;
    }

    try {
      this.editorStatus.textContent = "Parsing data...";
      this.editorStatus.className = "file-status file-success";

      const parsedQuestions = parseAndValidateRawText(rawData);

      logger.info("Raw payload validated securely", {
        questionsParsed: parsedQuestions.length
      });
      logger.debug("Starting quiz preview from parsed questions");

      this.quizUIController.loadCustomQuiz(parsedQuestions, true);

      this.editorStatus.textContent = "";
      this.editorStatus.className = "file-status";
    } catch (/** @type {any} */ err) {
      logger.warn("Payload validation rejected", { message: err.message });
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
    logger.info("exportEditorData called");
    const rawData = this.editorTextarea.value.trim();
    logger.debug("Evaluating editor payload for export", {
      length: rawData.length
    });
    if (!rawData) {
      this.editorStatus.textContent = "No data to export.";
      this.editorStatus.className = "file-status file-error";
      logger.warn("Export attempt failed: empty payload");
      return;
    }

    try {
      const parsedQuestions = parseAndValidateRawText(rawData);
      exportQAD(parsedQuestions);
      logger.info("Editor payload exported successfully", {
        questionCount: parsedQuestions.length
      });
      logger.debug("QAD file export triggered");
    } catch (/** @type {any} */ err) {
      logger.warn("Export validation rejected", { message: err.message });
      this.editorStatus.textContent = `Error: Cannot export invalid data. ${err.message}`;
      this.editorStatus.className = "file-status file-error";
    }
  }
}
