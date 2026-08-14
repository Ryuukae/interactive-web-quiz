import { createLogger } from "../utils/logger.js";

/**
 * Architectural Responsibilities: Centralized application router natively. Exclusively handles CSS visibility toggles to map the active viewport state seamlessly to the explicitly required stage.
 * Encapsulation Scope: Strictly isolated purely to global SPA transitions explicitly.
 * @class AppNavigationController
 * @name AppNavigationController
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 */
export default class AppNavigationController {
    /**
     * Provides internal functionality.
     * @type {Record<string, HTMLElement | null>}
     */
    screens;

    /**
     * Caches application screen nodes optimally and delegates fundamental routing interactions visually.
     * @name constructor
     * @public
     */
    constructor() {
        this.logger = createLogger("AppNavigationController");
        this.logger.info("constructor called");

        this.screens = {
            start: document.getElementById("start-screen"),
            quiz: document.getElementById("quiz-screen"),
            result: document.getElementById("result-screen"),
            creator: document.getElementById("creator-screen")
        };

        this.logger.info("Controller initialized", {
            screens: Object.keys(this.screens)
        });

        this.bindGlobalNavigation();
    }

    /**
     * Links physical DOM triggers cleanly to explicit routing capabilities.
     * @name bindGlobalNavigation
     * @public
     * @returns {void} - Does not return a value.
     */
    bindGlobalNavigation() {
        this.logger.info("bindGlobalNavigation called");
        this.logger.debug("Binding global navigation actions");

        const createBtn = document.getElementById("create-quizset-btn");
        if (createBtn instanceof HTMLButtonElement) {
            createBtn.addEventListener("click", () => {
                this.logger.info(
                    "bindGlobalNavigation: onCreateQuizsetClick event"
                );
                this.logger.info("Navigation request: creator screen");
                this.navigateTo("creator");
            });
        }

        const cancelBtn = document.getElementById("btn-cancel-create");
        if (cancelBtn instanceof HTMLButtonElement) {
            cancelBtn.addEventListener("click", () => {
                this.logger.info(
                    "bindGlobalNavigation: onCancelCreateClick event"
                );
                this.logger.info(
                    "Navigation request: start screen from creator cancel"
                );
                this.navigateTo("start");
            });
        }

        const returnBtn = document.getElementById("return-start-btn");
        if (returnBtn instanceof HTMLButtonElement) {
            returnBtn.addEventListener("click", () => {
                this.logger.info(
                    "bindGlobalNavigation: onReturnStartClick event"
                );
                this.logger.info(
                    "Navigation request: start screen from result"
                );
                this.navigateTo("start");
            });
        }

        const returnBuilderBtn = document.getElementById("return-builder-btn");
        if (returnBuilderBtn instanceof HTMLButtonElement) {
            returnBuilderBtn.addEventListener("click", () => {
                this.logger.info(
                    "bindGlobalNavigation: onReturnBuilderClick event"
                );
                this.logger.info(
                    "Navigation request: creator screen from result"
                );
                this.navigateTo("creator");
            });
        }

        const quizReturnBuilderBtn = document.getElementById(
            "quiz-return-builder-btn"
        );
        if (quizReturnBuilderBtn instanceof HTMLButtonElement) {
            quizReturnBuilderBtn.addEventListener("click", () => {
                this.logger.info(
                    "bindGlobalNavigation: onQuizReturnBuilderClick event"
                );
                this.logger.info(
                    "Navigation request: creator screen from aborted quiz test"
                );
                this.navigateTo("creator");
            });
        }
    }

    /**
     * Iterates through global view nodes to strictly force invisibility natively explicitly, then selectively appends the active class natively.
     * @name navigateTo
     * @public
     * @param {string} screenId - The string key natively mapping physically to cached nodes exclusively.
     * @returns {void} - Does not return a value.
     */
    navigateTo(screenId) {
        this.logger.info("navigateTo called", { screenId });
        this.logger.debug("Navigating to screen", { screenId });

        /* Iterates identically through cached DOM nodes natively to completely purge the dynamically active visibility class efficiently. */
        // ----------------------------------------------------------------------
        Object.values(this.screens).forEach((screen) => {
            this.logger.trace("navigateTo: resetActiveScreenCallback", {
                screenId: screen ? screen.id : null
            });
            if (screen) {
                screen.classList.remove("active");
            }
        });
        // ----------------------------------------------------------------------

        if (this.screens[screenId]) {
            this.screens[screenId].classList.add("active");
            this.logger.info("Screen activated", { screenId });
            return;
        }

        this.logger.warn("Attempted navigation to unknown screen", {
            screenId
        });
    }
}
