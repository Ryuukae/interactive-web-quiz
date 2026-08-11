import { createLogger } from "../utils/logger.js";

/**
 * @class AppNavigationController
 * @name AppNavigationController
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
 * @description
 * Architectural Responsibilities: Centralized application router natively. Exclusively handles CSS visibility toggles to map the active viewport state seamlessly to the explicitly required stage.
 *
 * Encapsulation Scope: Strictly isolated purely to global SPA transitions explicitly.
 */
export default class AppNavigationController {
    /**
     * @name constructor
     * @public
     * @description Caches application screen nodes optimally and delegates fundamental routing interactions visually.
     * @returns {void} - Does not return a value.
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
     * @name bindGlobalNavigation
     * @public
     * @description Links physical DOM triggers cleanly to explicit routing capabilities.
     * @returns {void} - Does not return a value.
     */
    bindGlobalNavigation() {
        this.logger.info("bindGlobalNavigation called");
        this.logger.debug("Binding global navigation actions");

        document
            .getElementById("create-quizset-btn")
            .addEventListener("click", () => {
                this.logger.info(
                    "bindGlobalNavigation: onCreateQuizsetClick event"
                );
                this.logger.info("Navigation request: creator screen");
                this.navigateTo("creator");
            });

        document
            .getElementById("btn-cancel-create")
            .addEventListener("click", () => {
                this.logger.info(
                    "bindGlobalNavigation: onCancelCreateClick event"
                );
                this.logger.info(
                    "Navigation request: start screen from creator cancel"
                );
                this.navigateTo("start");
            });

        document
            .getElementById("return-start-btn")
            .addEventListener("click", () => {
                this.logger.info(
                    "bindGlobalNavigation: onReturnStartClick event"
                );
                this.logger.info(
                    "Navigation request: start screen from result"
                );
                this.navigateTo("start");
            });
    }

    /**
     * @name navigateTo
     * @public
     * @description Iterates through global view nodes to strictly force invisibility natively explicitly, then selectively appends the active class natively.
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
