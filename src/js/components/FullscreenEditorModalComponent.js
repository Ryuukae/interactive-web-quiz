import { createLogger } from "../utils/logger.js";
import { getTxtTemplate, getJsonTemplate } from "../utils/templates.js";
import { readFile } from "../utils/fileIO.js";
import { confirmAction } from "../utils/prompts.js";

const logger = createLogger("FullscreenEditorModalComponent");

/**
 * Encapsulated workstation component for modifying raw text payloads in an expanded fullscreen modal.
 *
 * @class FullscreenEditorModalComponent
 * @name FullscreenEditorModalComponent
 * @version 1.6.1
 * @author Adam Ross DeStafeno
 * @property {AppNavigationControllerType} appNavController - The centralized screen and modal router.
 * @property {((text: string) => void) | null} onSaveCallback - Save callback when changes are applied.
 * @property {HTMLElement | null} modal - The fullscreen editor modal element.
 * @property {HTMLTextAreaElement} focusTextarea - The focus textarea element inside the modal.
 * @typedef {import('../types.js').AppNavigationControllerType} AppNavigationControllerType
 */
export default class FullscreenEditorModalComponent {
  /**
   * Initializes the fullscreen editor modal DOM bindings and cached nodes.
   * @param {AppNavigationControllerType} appNavController - The centralized routing controller.
   */
  constructor(appNavController) {
    logger.info("constructor called");
    logger.debug("Initializing FullscreenEditorModalComponent DOM elements");
    this.appNavController = appNavController;
    this.onSaveCallback = null;

    this.modal = document.getElementById("modal-focus-editor");
    const textarea = document.getElementById("focus-editor-textarea");
    if (!(textarea instanceof HTMLTextAreaElement)) {
      throw new Error("focus-editor-textarea missing or invalid");
    }
    this.focusTextarea = textarea;

    logger.debug("FullscreenEditorModalComponent DOM elements cached");
    this.bindEvents();
  }

  /**
   * Binds event listeners for modal actions, templates, and file imports.
   * @returns {void}
   */
  bindEvents() {
    logger.info("bindEvents called");
    logger.debug(
      "Binding fullscreen focus editor control and template listeners"
    );
    const closeBtn = document.getElementById("close-focus-editor-btn");
    const cancelBtn = document.getElementById("btn-focus-editor-cancel");
    const doneBtn = document.getElementById("btn-focus-editor-done");

    const txtTemplateBtn = document.getElementById("btn-focus-template-txt");
    const jsonTemplateBtn = document.getElementById("btn-focus-template-json");
    const focusImportInput = document.getElementById("input-focus-import-file");

    const discardAndClose = () => {
      logger.info("Fullscreen focus editor closed via discard");
      logger.debug("Closing fullscreen editor modal without saving changes");
      this.appNavController.closeModalById("modal-focus-editor");
    };

    if (closeBtn) closeBtn.addEventListener("click", discardAndClose);
    if (cancelBtn) cancelBtn.addEventListener("click", discardAndClose);

    if (doneBtn) {
      doneBtn.addEventListener("click", () => {
        logger.info("Fullscreen focus editor applied and saved");
        logger.debug("Triggering onSaveCallback with focusTextarea content", {
          contentLength: this.focusTextarea.value.length
        });
        if (this.onSaveCallback) {
          this.onSaveCallback(this.focusTextarea.value);
        }
        this.appNavController.closeModalById("modal-focus-editor");
      });
    }

    if (
      typeof HTMLInputElement !== "undefined" &&
      focusImportInput instanceof HTMLInputElement
    ) {
      focusImportInput.addEventListener("change", async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement) || !target.files?.[0]) return;
        const file = target.files[0];
        logger.debug("Processing file import in fullscreen focus editor", {
          fileName: file.name,
          size: file.size
        });

        if (this.focusTextarea.value.trim() !== "") {
          if (
            !confirmAction(
              "Importing this file will overwrite your current text. Do you wish to continue?"
            )
          ) {
            logger.debug(
              "File import canceled by user in fullscreen focus editor"
            );
            target.value = "";
            return;
          }
        }

        try {
          const content = await readFile(file);
          this.focusTextarea.value = content;
          logger.info("File imported into focus editor", {
            fileName: file.name
          });
          logger.debug("Focus textarea updated with imported file content", {
            length: content.length
          });
        } catch (err) {
          logger.error("Failed to read imported file in focus editor", err);
        } finally {
          target.value = "";
        }
      });
    }

    if (txtTemplateBtn) {
      txtTemplateBtn.addEventListener("click", () => {
        logger.info("bindEvents: onTxtTemplateClick event");
        if (this.focusTextarea.value.trim() !== "") {
          if (
            !confirmAction(
              "Inserting this template will overwrite your current text. Do you wish to continue?"
            )
          ) {
            logger.debug("TXT template insertion canceled by user");
            return;
          }
        }
        this.focusTextarea.value = getTxtTemplate();
        logger.debug("TXT template injected into focus editor");
      });
    }

    if (jsonTemplateBtn) {
      jsonTemplateBtn.addEventListener("click", () => {
        logger.info("bindEvents: onJsonTemplateClick event");
        if (this.focusTextarea.value.trim() !== "") {
          if (
            !confirmAction(
              "Inserting this template will overwrite your current text. Do you wish to continue?"
            )
          ) {
            logger.debug("JSON template insertion canceled by user");
            return;
          }
        }
        this.focusTextarea.value = getJsonTemplate();
        logger.debug("JSON template injected into focus editor");
      });
    }
  }

  /**
   * Opens the fullscreen focus editor populated with the provided text.
   * @param {string} initialText - The text to populate the workstation.
   * @param {((text: string) => void) | null} onSave - Callback executing when changes are applied.
   * @returns {void}
   */
  open(initialText, onSave) {
    logger.info("FullscreenEditorModalComponent.open called", {
      textLength: initialText ? initialText.length : 0
    });
    logger.debug(
      "Populating fullscreen focus editor textarea and opening modal"
    );
    this.focusTextarea.value = initialText;
    this.onSaveCallback = onSave;

    this.appNavController.openModalById("modal-focus-editor");

    setTimeout(() => {
      logger.debug("Focusing fullscreen editor textarea");
      this.focusTextarea.focus();
    }, 100);
  }
}
