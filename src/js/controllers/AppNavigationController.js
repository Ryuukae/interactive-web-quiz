import { createLogger } from "../utils/logger.js";

const logger = createLogger("AppNavigationController");

/**
 * Centralized application router handling screen visibility and modal lifecycle states.
 * Maps the active viewport state to the required screen and manages modal dialogs.
 *
 * @class AppNavigationController
 * @name AppNavigationController
 * @version 1.6.3
 * @author Adam Ross DeStafeno
 * @property {Record<string, HTMLElement | null>} screens - Cached DOM references for routing.
 * @typedef {import('../types.js').ScreenKey} ScreenKey
 * @typedef {import('../types.js').ModalId} ModalId
 */
export default class AppNavigationController {
  /**
   * Caches application screen nodes and binds global navigation triggers.
   * @name constructor
   * @public
   */
  constructor() {
    logger.info("constructor called");
    logger.debug("Initializing AppNavigationController screen bindings");

    // Casting the entire object ensures strict adherence to the Record type
    this.screens = /** @type {Record<string, HTMLElement | null>} */ ({
      start: document.getElementById("start-screen"),
      quiz: document.getElementById("quiz-screen"),
      result: document.getElementById("result-screen"),
      creator: document.getElementById("creator-screen"),
      editor: document.getElementById("editor-screen")
    });

    logger.info("Controller initialized", {
      screens: Object.keys(this.screens)
    });
    logger.debug(
      "AppNavigationController initialized with cached screen references"
    );

    this.bindGlobalNavigation();
  }

  /**
   * Closes all active modal dialogues and dismisses the global backdrop.
   * @name closeAllModals
   * @public
   * @returns {void}
   */
  closeAllModals() {
    logger.info("closeAllModals called");
    const modals = document.querySelectorAll(".modal");
    logger.debug("Closing active modals", { modalCount: modals.length });
    modals.forEach((m) => m.classList.remove("active"));
    const backdrop = document.getElementById("modal-backdrop");
    if (backdrop) backdrop.classList.remove("active");
    logger.debug("Modals dismissed and backdrop hidden");
  }

  /**
   * Displays the modal corresponding to the provided ID and activates the global backdrop.
   * @name openModalById
   * @public
   * @param {ModalId} modalId - The element ID of the modal to open.
   * @returns {void}
   */
  openModalById(modalId) {
    logger.info("openModalById called", { modalId });
    this.closeAllModals();
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
      targetModal.classList.add("active");
      logger.debug("Modal activated", { modalId });
    } else {
      logger.warn("Modal element not found", { modalId });
    }
    const backdrop = document.getElementById("modal-backdrop");
    if (backdrop) backdrop.classList.add("active");
  }

  /**
   * Closes the specific modal and dismisses the global backdrop.
   * @name closeModalById
   * @public
   * @param {ModalId} modalId - The element ID of the modal to close.
   * @returns {void}
   */
  closeModalById(modalId) {
    logger.info("closeModalById called", { modalId });
    const targetModal = document.getElementById(modalId);
    if (targetModal) {
      targetModal.classList.remove("active");
      logger.debug("Modal deactivated", { modalId });
    }
    const backdrop = document.getElementById("modal-backdrop");
    if (backdrop) backdrop.classList.remove("active");
  }

  /**
   * Links DOM triggers cleanly to routing capabilities and modal events.
   * @name bindGlobalNavigation
   * @public
   * @returns {void}
   */
  bindGlobalNavigation() {
    logger.info("bindGlobalNavigation called");
    logger.debug("Binding global navigation and modal actions");

    const backdrop = document.getElementById("modal-backdrop");

    // Global modal close buttons
    const closeButtons = document.querySelectorAll(".modal-close-btn");
    closeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        logger.debug("Global modal close button clicked");
        this.closeAllModals();
      });
    });

    if (backdrop instanceof HTMLElement) {
      backdrop.addEventListener("click", () => {
        logger.debug("Modal backdrop clicked");
        this.closeAllModals();
      });
    }

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        logger.debug("Escape key pressed, dismissing modals");
        this.closeAllModals();
      }
    });

    const openTxtGuideBtn = document.getElementById("btn-open-txt-guide");
    if (openTxtGuideBtn instanceof HTMLButtonElement) {
      openTxtGuideBtn.addEventListener("click", () => {
        logger.info("bindGlobalNavigation: onOpenTxtGuideClick event");
        logger.debug("Opening TXT format guide modal");
        this.openModalById("modal-guide-txt");
      });
    }

    const openJsonGuideBtn = document.getElementById("btn-open-json-guide");
    if (openJsonGuideBtn instanceof HTMLButtonElement) {
      openJsonGuideBtn.addEventListener("click", () => {
        logger.info("bindGlobalNavigation: onOpenJsonGuideClick event");
        logger.debug("Opening JSON format guide modal");
        this.openModalById("modal-guide-json");
      });
    }

    const cancelBtn = document.getElementById("btn-cancel-create");
    if (cancelBtn instanceof HTMLButtonElement) {
      cancelBtn.addEventListener("click", () => {
        logger.info("bindGlobalNavigation: onCancelCreateClick event");
        logger.debug("Navigating from creation modal back to start screen");
        this.navigateTo("start");
      });
    }

    const returnBtn = document.getElementById("return-start-btn");
    if (returnBtn instanceof HTMLButtonElement) {
      returnBtn.addEventListener("click", () => {
        logger.info("bindGlobalNavigation: onReturnStartClick event");
        logger.debug("Returning to start screen");
        this.navigateTo("start");
      });
    }

    const returnBuilderBtn = document.getElementById("return-builder-btn");
    if (returnBuilderBtn instanceof HTMLButtonElement) {
      returnBuilderBtn.addEventListener("click", () => {
        logger.info("bindGlobalNavigation: onReturnBuilderClick event");
        logger.debug("Returning to builder creator screen");
        this.navigateTo("creator");
      });
    }

    const quizReturnBuilderBtn = document.getElementById(
      "quiz-return-builder-btn"
    );
    if (quizReturnBuilderBtn instanceof HTMLButtonElement) {
      quizReturnBuilderBtn.addEventListener("click", () => {
        logger.info("bindGlobalNavigation: onQuizReturnBuilderClick event");
        logger.debug("Returning from quiz directly to builder screen");
        this.navigateTo("creator");
      });
    }
  }

  /**
   * Toggles active classes across screen elements to render the selected screen.
   * @name navigateTo
   * @public
   * @param {ScreenKey} screenKey - The target screen key identifier.
   * @returns {void}
   */
  navigateTo(screenKey) {
    logger.info("navigateTo called", { screenKey });
    logger.debug("Resolving screen DOM ID for key", { screenKey });

    const screenMap = {
      start: "start-screen",
      creator: "creator-screen",
      editor: "editor-screen",
      quiz: "quiz-screen",
      result: "result-screen"
    };

    const targetId = screenMap[screenKey];
    if (!targetId) {
      logger.warn("Attempted navigation to unknown screen", { screenKey });
      return;
    }

    for (const id of Object.values(screenMap)) {
      const el = document.getElementById(id);
      if (!el) continue;

      const isActive = id === targetId;
      el.classList.toggle("active", isActive);
      el.setAttribute("aria-hidden", isActive ? "false" : "true");
    }

    const container = document.querySelector(".container");
    if (container) {
      container.classList.remove(
        "screen-start",
        "screen-creator",
        "screen-quiz",
        "screen-result",
        "screen-editor"
      );
      container.classList.add(`screen-${screenKey}`);
    }
    logger.debug("Active screen styles and accessibility attributes updated", {
      screenKey
    });
    logger.info("Navigation complete", { activeScreen: screenKey });
  }
}
