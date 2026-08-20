import { readFile } from "../utils/fileIO.js";
import { parseAndValidateRawText } from "../utils/schemaValidator.js";
import { confirmAction } from "../utils/prompts.js";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("StartUIController");

/**
 * UI controller coordinating the initial start screen.
 * Handles ingestion of files, validation, and staging payload handoffs.
 *
 * @class StartUIController
 * @name StartUIController
 * @version 1.6.1
 * @author Adam Ross DeStafeno
 * @property {AppNavigationControllerType} appNavController - Router controller for screen transitions.
 * @property {QuizUIControllerType} quizUIController - Controller for running quiz sessions.
 * @property {BuilderUIControllerType} builderUIController - Controller for form builder workstation.
 * @property {EditorUIControllerType} editorUIController - Controller for advanced text editor.
 * @property {ModifyQuizPayloadType | null} pendingModifyData - Staged modify payload.
 * @typedef {import('../types.js').QuizUIControllerType} QuizUIControllerType
 * @typedef {import('../types.js').BuilderUIControllerType} BuilderUIControllerType
 * @typedef {import('../types.js').EditorUIControllerType} EditorUIControllerType
 * @typedef {import('../types.js').AppNavigationControllerType} AppNavigationControllerType
 * @typedef {import('../types.js').ModifyQuizPayloadType} ModifyQuizPayloadType
 */
export default class StartUIController {
  /**
   * Initializes start screen bindings and dependencies.
   * @param {AppNavigationControllerType} appNavController - The centralized screen and modal router.
   * @param {QuizUIControllerType} quizUIController - For executing quizzes.
   * @param {BuilderUIControllerType} builderUIController - For staging form builder questions.
   * @param {EditorUIControllerType} editorUIController - For staging raw text questions.
   */
  constructor(
    appNavController,
    quizUIController,
    builderUIController,
    editorUIController
  ) {
    logger.info("constructor called");
    logger.debug("Initializing StartUIController dependencies", {
      hasAppNav: Boolean(appNavController),
      hasQuizUI: Boolean(quizUIController),
      hasBuilderUI: Boolean(builderUIController),
      hasEditorUI: Boolean(editorUIController)
    });

    this.appNavController = appNavController;
    this.quizUIController = quizUIController;
    this.builderUIController = builderUIController;
    this.editorUIController = editorUIController;

    /** @type {ModifyQuizPayloadType | null} */
    this.pendingModifyData = null;

    logger.info("Start UI controller initialized");
    logger.debug("Start UI controller ready for user interaction");

    this.bindEventListeners();
  }

  /**
   * Delegates click and change events on start screen controls.
   * @returns {void}
   */
  bindEventListeners() {
    logger.info("bindEventListeners called");
    logger.debug("Binding Start UI file input and modal button listeners");

    const takeQuizInput = document.getElementById("take-quiz-file-input");
    if (takeQuizInput instanceof HTMLInputElement) {
      takeQuizInput.addEventListener("change", async (e) => {
        logger.info("Take a quiz file selected");
        const target = e.target;
        if (!(target instanceof HTMLInputElement) || !target.files?.[0]) return;
        const file = target.files[0];
        logger.debug("Processing take-quiz file upload", {
          fileName: file.name,
          size: file.size
        });
        const statusNode = document.getElementById("file-name-display");

        try {
          if (statusNode) {
            statusNode.className = "file-status visible";
            statusNode.textContent = `Analyzing ${file.name}...`;
          }
          const rawText = await readFile(file);
          logger.debug("Raw file content read successfully", {
            characterCount: rawText.length
          });
          const parsedQuestions = parseAndValidateRawText(rawText);
          logger.debug("Raw file parsed into valid questions", {
            questionCount: parsedQuestions.length
          });

          if (statusNode) {
            statusNode.className = "file-status success visible";
            statusNode.textContent = `${file.name} (Ready)`;
          }

          this.pendingModifyData = null; // Clear any conflicting data
          logger.info("Launching custom quiz from file", {
            fileName: file.name,
            questionCount: parsedQuestions.length
          });
          logger.debug("Dispatching payload to QuizUIController", {
            questionCount: parsedQuestions.length
          });
          this.quizUIController.loadCustomQuiz(parsedQuestions, false);
        } catch (error) {
          const errMessage =
            error instanceof Error ? error.message : "Unknown error";
          logger.error("Take quiz file evaluation failed", error);
          if (statusNode) {
            statusNode.className = "file-status error visible";
            statusNode.textContent = `Error: ${errMessage}`;
          }
        } finally {
          target.value = "";
        }
      });
    }

    const modifyQuizInput = document.getElementById("modify-quiz-file-input");
    if (modifyQuizInput instanceof HTMLInputElement) {
      modifyQuizInput.addEventListener("change", async (e) => {
        logger.info("Modify a quiz file selected");
        const target = e.target;
        if (!(target instanceof HTMLInputElement) || !target.files?.[0]) return;
        const file = target.files[0];
        logger.debug("Processing modify-quiz file upload", {
          fileName: file.name,
          size: file.size
        });
        const statusNode = document.getElementById("file-name-display");

        try {
          if (statusNode) {
            statusNode.className = "file-status visible";
            statusNode.textContent = `Analyzing ${file.name}...`;
          }
          const rawText = await readFile(file);
          logger.debug("Raw modify file content read", {
            characterCount: rawText.length
          });
          const parsedQuestions = parseAndValidateRawText(rawText);
          logger.debug("Parsed modify questions", {
            questionCount: parsedQuestions.length
          });

          if (statusNode) {
            statusNode.className = "file-status success visible";
            statusNode.textContent = `${file.name} (Ready to Edit)`;
          }

          this.pendingModifyData = {
            parsedQuestions,
            rawText,
            fileName: file.name
          };
          logger.info("Staged pendingModifyData successfully", {
            fileName: file.name
          });
          logger.debug("Opening creation-mode-modal for staging choice");

          this.appNavController.openModalById("creation-mode-modal");
        } catch (error) {
          const errMessage =
            error instanceof Error ? error.message : "Unknown error";
          logger.error("Modify quiz file evaluation failed", error);
          if (statusNode) {
            statusNode.className = "file-status error visible";
            statusNode.textContent = `Error: ${errMessage}`;
          }
        } finally {
          target.value = "";
        }
      });
    }

    // Connect Start Screen logical branching modal paths securely
    const createBtn = document.getElementById("create-quizset-btn");
    if (createBtn instanceof HTMLButtonElement) {
      createBtn.addEventListener("click", () => {
        logger.info("bindEventListeners: onCreateQuizsetClick event");
        logger.debug("Opening creation-mode-modal for blank quiz creation");
        this.pendingModifyData = null;
        this.appNavController.openModalById("creation-mode-modal");
      });
    }

    const useBuilderBtn = document.getElementById("btn-use-builder");
    if (useBuilderBtn instanceof HTMLButtonElement) {
      useBuilderBtn.addEventListener("click", () => {
        logger.info("bindEventListeners: onUseBuilderClick event");
        if (this.pendingModifyData) {
          const hasData = this.builderUIController?.hasExistingData();
          if (hasData) {
            logger.debug(
              "Existing data detected in Builder UI, prompting confirmation"
            );
            if (
              !confirmAction(
                "You currently have existing quiz data present in the Form Builder. Importing this file will overwrite your current data. Do you wish to continue?"
              )
            ) {
              logger.debug("Builder overwrite cancelled by user");
              return;
            }
          }
          this.appNavController.closeAllModals();
          logger.info("Populating GUI builder with uploaded modify payload");
          logger.debug("Injecting parsed questions into builder cards", {
            questionCount: this.pendingModifyData.parsedQuestions.length
          });
          if (this.builderUIController) {
            this.builderUIController.populateCardsFromData(
              this.pendingModifyData.parsedQuestions
            );
          }
          this.pendingModifyData = null;
        } else {
          logger.debug(
            "Navigating to builder screen with blank or existing workspace"
          );
          this.appNavController.closeAllModals();
        }
        this.appNavController.navigateTo("creator");
      });
    }

    const useEditorBtn = document.getElementById("btn-use-editor");
    if (useEditorBtn instanceof HTMLButtonElement) {
      useEditorBtn.addEventListener("click", () => {
        logger.info("bindEventListeners: onUseEditorClick event");
        if (this.pendingModifyData) {
          const hasData = this.editorUIController?.hasExistingData();
          if (hasData) {
            logger.debug(
              "Existing data detected in Text Editor, prompting confirmation"
            );
            if (
              !confirmAction(
                "You currently have existing quiz data present in the Text Editor. Importing this file will overwrite your current data. Do you wish to continue?"
              )
            ) {
              logger.debug("Editor overwrite cancelled by user");
              return;
            }
          }
          this.appNavController.closeAllModals();
          logger.info("Populating Text Editor with uploaded modify payload");
          logger.debug("Setting editor textarea value from rawText", {
            characterCount: this.pendingModifyData.rawText.length
          });
          if (
            this.editorUIController &&
            this.editorUIController.editorTextarea
          ) {
            this.editorUIController.editorTextarea.value =
              this.pendingModifyData.rawText;
          }
          this.pendingModifyData = null;
        } else {
          logger.debug("Navigating to text editor screen with blank workspace");
          this.appNavController.closeAllModals();
        }
        this.appNavController.navigateTo("editor");
      });
    }
  }
}
