import { createLogger } from "../utils/logger.js";

/**
 * Architectural Responsibilities: Centralized application router natively. Exclusively handles CSS visibility toggles to map the active viewport state seamlessly to the explicitly required stage.
 * Encapsulation Scope: Strictly isolated purely to global SPA transitions explicitly.
 * @class AppNavigationController
 * @name AppNavigationController
 * @version 1.3.1
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
     * @param {string} screenKey - The string key natively mapping physically to cached nodes exclusively.
     * @returns {void} - Does not return a value.
     */
    navigateTo(screenKey) {
        this.logger.info("navigateTo called", { screenKey });
        this.logger.debug("Navigating to screen", { screenKey });

        const screenMap = {
            start: "start-screen",
            creator: "creator-screen",
            quiz: "quiz-screen",
            result: "result-screen"
        };

        const targetId = screenMap[screenKey];
        if (!targetId) {
            this.logger.warn("Attempted navigation to unknown screen", {
                screenKey
            });
            return;
        }

        for (const id of Object.values(screenMap)) {
            const el = document.getElementById(id);
            if (!el) continue;

            const isActive = id === targetId;
            el.classList.toggle("active", isActive);
            el.setAttribute("aria-hidden", isActive ? "false" : "true");

            if (isActive) {
                this.logger.info("Screen activated", { screenId: id });
            }
        }
    }
}
