import { getTxtTemplate, getJsonTemplate } from "../utils/templates.js";
import { confirmAction, alertAction } from "../utils/prompts.js";
import { exportJSON } from "../utils/fileIO.js";
import { parseAndValidateRawText } from "../utils/schemaValidator.js";
import BuilderCardComponent from "../components/BuilderCardComponent.js";
import { createLogger } from "../utils/logger.js";

/**
 * @typedef {import('../models/BuilderState.js').default} BuilderStateType
 * @typedef {import('./QuizUIController.js').default} QuizUIControllerType
 * @typedef {import('./AppNavigationController.js').default} AppNavigationControllerType
 */

/**
 * @class BuilderUIController
 * @name BuilderUIController
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
 * @description
 * Architectural Responsibilities: Solely coordinates the Form Builder GUI. Maps UI actions (Add, Bulk Parse, Clear All) strictly to physical Component actions or logical Model mutations.
 *
 * Encapsulation Scope: Modulates `#creator-screen` capabilities comprehensively.
 */
export default class BuilderUIController {
    /**
     * @param {string} id
     * @returns {HTMLElement}
     */
    getEl(id) {
        const el = document.getElementById(id);
        if (!(el instanceof HTMLElement)) throw new Error(`Missing DOM node: ${id}`);
        return el;
    }

    /**
     * @name constructor
     * @public
     * @description Links physical nodes with Model authorities cleanly.
     * @param {BuilderStateType} builderState - The central tracker modeling card components natively.
     * @param {QuizUIControllerType} quizUIController - Exposed for direct bypass assessment triggers explicitly.
     * @param {AppNavigationControllerType} appNavController - Coordinates manual routing assignments optimally.
     */
    constructor(builderState, quizUIController, appNavController) {
        this.logger = createLogger("BuilderUIController");
        this.logger.info("constructor called", {
            builderState,
            quizUIController,
            appNavController
        });
        this.builderState = builderState;
        this.quizUIController = quizUIController;
        this.appNavController = appNavController;

        this.builderContainer = this.getEl("builder-questions-container");
        this.bulkImportPanel = this.getEl("bulk-import-panel");
        
        const bulkImportTextEl = this.getEl("bulk-import-text");
        if (!(bulkImportTextEl instanceof HTMLTextAreaElement)) {
            throw new Error("bulk-import-text element not found or not a textarea");
        }
        this.bulkImportText = bulkImportTextEl;

        this.bulkImportStatus = this.getEl("bulk-import-status");

        this.logger.info("Builder UI controller initialized");

        this.initializeEventListeners();
    }

    /**
     * @name initializeEventListeners
     * @public
     * @description Hooks physical actions explicitly to bounded component workflows and logical routines securely.
     * @returns {void} - Does not return a value.
     */
    initializeEventListeners() {
        this.logger.info("initializeEventListeners called");
        this.getEl("create-quizset-btn")
            .addEventListener("click", () => {
                this.logger.info(
                    "initializeEventListeners: onCreateQuizsetClick event"
                );
                this.logger.info("Create quiz set requested from builder UI");
                this.initializeBuilder();
            });

        this.getEl("btn-add-question")
            .addEventListener("click", () => {
                this.logger.info(
                    "initializeEventListeners: onAddQuestionClick event"
                );
                this.logger.info("Add question requested");
                this.handleAddQuestion();
            });

        this.getEl("btn-run-builder-quiz")
            .addEventListener("click", () => {
                this.logger.info(
                    "initializeEventListeners: onRunBuilderQuizClick event"
                );
                this.logger.info("Run builder quiz requested");
                this.startBuilderQuiz();
            });

        this.getEl("btn-export-quiz")
            .addEventListener("click", () => {
                this.logger.info(
                    "initializeEventListeners: onExportQuizClick event"
                );
                this.logger.info("Export builder quiz requested");
                this.exportBuilderQuiz();
            });

        this.bulkImportText.addEventListener("input", () => {
            this.adjustBulkImportTextareaHeight();
        });

        this.getEl("btn-parse-bulk")
            .addEventListener("click", () => {
                this.logger.info(
                    "initializeEventListeners: onParseBulkClick event"
                );
                this.logger.info("Bulk import parse requested");
                this.handleBulkImport();
            });

        this.getEl("bulk-import-header")
            .addEventListener("click", () => {
                this.logger.info(
                    "initializeEventListeners: onBulkImportHeaderClick event"
                );
                const isNowCollapsed =
                    this.bulkImportPanel.classList.toggle("collapsed");
                this.logger.debug("Bulk import panel toggled", {
                    collapsed: isNowCollapsed
                });
                if (!isNowCollapsed) {
                    this.builderState.collapseAllCards();
                    requestAnimationFrame(() =>
                        this.adjustBulkImportTextareaHeight()
                    );
                }
            });

        this.getEl("btn-template-txt")
            .addEventListener("click", () => {
                this.logger.info(
                    "initializeEventListeners: onTemplateTxtClick event"
                );
                if (this.bulkImportText.value.trim() !== "") {
                    if (
                        !confirmAction(
                            "Inserting this template will overwrite your current text. Do you wish to continue?"
                        )
                    ) {
                        return;
                    }
                }
                this.logger.info(
                    "Text template inserted into bulk import field"
                );
                this.bulkImportText.value = getTxtTemplate();
                this.adjustBulkImportTextareaHeight();
            });

        this.getEl("btn-template-json")
            .addEventListener("click", () => {
                this.logger.info(
                    "initializeEventListeners: onTemplateJsonClick event"
                );
                if (this.bulkImportText.value.trim() !== "") {
                    if (
                        !confirmAction(
                            "Inserting this template will overwrite your current text. Do you wish to continue?"
                        )
                    ) {
                        return;
                    }
                }
                this.logger.info(
                    "JSON template inserted into bulk import field"
                );
                this.bulkImportText.value = getJsonTemplate();
                this.adjustBulkImportTextareaHeight();
            });

        this.getEl("btn-clear-builder")
            .addEventListener("click", () => {
                this.logger.info(
                    "initializeEventListeners: onClearBuilderClick event"
                );
                this.logger.info("Clear builder requested", {
                    cardCount: this.builderState.cards.length
                });
                if (this.builderState.cards.length === 0) return;
                if (
                    confirmAction(
                        "Are you sure you want to clear all questions? This action cannot be undone."
                    )
                ) {
                    this.builderState.clearAll();
                }
            });
    }

    /**
     * @name collapseBulkImport
     * @public
     * @description Safely forces the bulk import panel into a constrained CSS visibility state.
     * @returns {void} - Does not return a value.
     */
    collapseBulkImport() {
        this.logger.info("collapseBulkImport called");
        if (!this.bulkImportPanel.classList.contains("collapsed")) {
            this.bulkImportPanel.classList.add("collapsed");
            this.logger.debug("Bulk import panel collapsed");
        }
    }

    /**
     * @name adjustBulkImportTextareaHeight
     * @public
     * @description Dynamically recalculates and applies the required height for the bulk import text area to ensure all content is fully visible without internal scrollbars.
     * @returns {void} - Does not return a value.
     */
    adjustBulkImportTextareaHeight() {
        if (!this.bulkImportText) return;
        this.bulkImportText.style.height = "auto";
        const contentHeight = Math.max(100, this.bulkImportText.scrollHeight);
        this.bulkImportText.style.height = `${contentHeight}px`;
        this.logger.trace("adjustBulkImportTextareaHeight executed", {
            newHeight: contentHeight
        });
    }

    /**
     * @name scrollToFirstError
     * @public
     * @description Locates the first validation error within the builder container and scrolls it smoothly into the viewport.
     * @returns {void} - Does not return a value.
     */
    scrollToFirstError() {
        this.logger.info("scrollToFirstError called");
        this.logger.debug("Scrolling to first builder validation error");
        /* Defers execution briefly to ensure DOM paint mapping is completed prior to scroll interception natively. */
        // ----------------------------------------------------------------------
        setTimeout(() => {
            this.logger.info(
                "scrollToFirstError: scrollTimeoutCallback executed"
            );
            const firstError =
                this.builderContainer.querySelector(".input-error");
            if (firstError) {
                firstError.scrollIntoView({
                    behavior: "smooth",
                    block: "center"
                });
                this.logger.info("Scrolled to first builder validation error");
            }
        }, 50);
        // ----------------------------------------------------------------------
    }

    /**
     * @name initializeBuilder
     * @public
     * @description Purges legacy artifacts completely, explicitly triggering primary baseline construction capabilities to guarantee a fresh logical execution state.
     * @returns {void} - Does not return a value.
     */
    initializeBuilder() {
        this.logger.info("initializeBuilder called");
        this.logger.info("Initializing builder workspace");
        this.builderState.clearAll();

        const newCard = new BuilderCardComponent(
            null,
            (card) => {
                this.logger.info("initializeBuilder: removeCardCallback", {
                    card
                });
                this.builderState.removeCard(card);
            },
            () => {
                this.logger.info("initializeBuilder: expandCallback");
                this.collapseBulkImport();
            }
        );
        this.builderState.addCard(newCard);
        this.builderContainer.appendChild(newCard.node);
        this.logger.info("Builder workspace initialized", {
            cardCount: this.builderState.cards.length
        });
    }

    /**
     * @name handleAddQuestion
     * @public
     * @description Safeguards validation protocols natively, collapsing active visual tracks, triggering strict node generation, and scrolling into bounded zones systematically.
     * @returns {void} - Does not return a value.
     */
    handleAddQuestion() {
        this.logger.info("handleAddQuestion called");
        this.logger.info("Handling add question request");
        /* Encapsulates the execution chain to strictly block execution mapping errors while preserving physical viewport alignment properties dynamically. */
        // ----------------------------------------------------------------------
        if (!this.builderState.validateAllCards()) {
            this.logger.warn("Add question blocked by validation failure");
            this.scrollToFirstError();
            return;
        }

        this.collapseBulkImport();
        this.builderState.collapseAllCards();

        const newCard = new BuilderCardComponent(
            null,
            (card) => {
                this.logger.info("handleAddQuestion: removeCardCallback", {
                    card
                });
                this.builderState.removeCard(card);
            },
            () => {
                this.logger.info("handleAddQuestion: expandCallback");
                this.collapseBulkImport();
            }
        );
        this.builderState.addCard(newCard);
        this.builderContainer.appendChild(newCard.node);

        setTimeout(() => {
            this.logger.info(
                "handleAddQuestion: scrollTimeoutCallback executed"
            );
            this.builderContainer.scrollTo({
                top: this.builderContainer.scrollHeight,
                behavior: "smooth"
            });
            this.logger.info("Builder scrolled to newest question", {
                cardCount: this.builderState.cards.length
            });
        }, 50);
        // ----------------------------------------------------------------------
    }

    /**
     * @name handleBulkImport
     * @public
     * @description Processes isolated text payloads dynamically against external data layers, securely extracting arrays, iterating instantiations, and resolving UI cues actively.
     * @returns {void} - Does not return a value.
     */
    handleBulkImport() {
        this.logger.info("handleBulkImport called");
        const rawText = this.bulkImportText.value;

        if (!rawText.trim()) {
            this.logger.warn("Bulk import ignored because the input is empty");
            return;
        }

        this.bulkImportStatus.classList.remove("error", "visible");
        this.bulkImportStatus.textContent = "";

        this.logger.info("Bulk import parse started", {
            characterCount: rawText.length
        });

        try {
            /* Parses and validates the raw text string to construct formatted question payloads seamlessly. */
            // ----------------------------------------------------------------------
            const parsedData = parseAndValidateRawText(rawText);
            this.logger.info("Bulk import parsed successfully", {
                questionCount: parsedData.length
            });

            parsedData.forEach((q) => {
                this.logger.trace("handleBulkImport: appendCardCallback", {
                    question: q.question
                });
                const newCard = new BuilderCardComponent(
                    q,
                    (card) => {
                        this.logger.info(
                            "handleBulkImport: removeCardCallback",
                            { card }
                        );
                        this.builderState.removeCard(card);
                    },
                    () => {
                        this.logger.info("handleBulkImport: expandCallback");
                        this.collapseBulkImport();
                    }
                );
                this.builderState.addCard(newCard);
                this.builderContainer.appendChild(newCard.node);
            });
            // ----------------------------------------------------------------------

            this.bulkImportText.value = "";
            this.adjustBulkImportTextareaHeight();
            this.logger.info("Bulk import cards appended", {
                cardCount: this.builderState.cards.length
            });

            setTimeout(() => {
                this.logger.info(
                    "handleBulkImport: scrollTimeoutCallback executed"
                );
                this.builderContainer.scrollTo({
                    top: this.builderContainer.scrollHeight,
                    behavior: "smooth"
                });
                this.logger.debug(
                    "Builder container scrolled after bulk import"
                );
            }, 50);
        } catch (error) {
            const errMessage = error instanceof Error ? error.message : "Unknown error";
            this.logger.error("Bulk parsing failed", error);
            this.bulkImportStatus.textContent = `Error: ${errMessage}`;
            this.bulkImportStatus.classList.add("error", "visible");
        }
    }

    /**
     * @name startBuilderQuiz
     * @public
     * @description Manages error interception cleanly and delegates custom payload parsing natively to the external testing controller bypass function natively.
     * @returns {void} - Does not return a value.
     */
    startBuilderQuiz() {
        this.logger.info("startBuilderQuiz called");
        this.logger.info("Starting builder quiz preview");
        if (this.builderState.cards.length === 0) {
            this.logger.warn(
                "Builder quiz start blocked because there are no questions"
            );
            alertAction(
                "Please add at least one question before starting the quiz."
            );
            return;
        }

        if (!this.builderState.validateAllCards()) {
            this.logger.warn(
                "Builder quiz start blocked by validation failure"
            );
            this.collapseBulkImport();
            this.scrollToFirstError();
            return;
        }

        const payload = this.builderState.getSerializedPayload();

        if (payload.length === 0) {
            this.logger.warn(
                "Builder quiz start blocked because serialized payload is empty"
            );
            alertAction(
                "Please complete at least one question before starting."
            );
            return;
        }

        this.logger.info("Builder quiz payload ready", {
            questionCount: payload.length
        });
        this.quizUIController.loadCustomQuiz(payload);
    }

    /**
     * @name exportBuilderQuiz
     * @public
     * @description Scrapes localized logical states explicitly against output algorithms seamlessly physically.
     * @returns {void} - Does not return a value.
     */
    exportBuilderQuiz() {
        this.logger.info("exportBuilderQuiz called");
        this.logger.info("Exporting builder quiz");
        if (this.builderState.cards.length === 0) {
            this.logger.warn(
                "Builder export blocked because there are no questions"
            );
            alertAction("Please add at least one question before exporting.");
            return;
        }

        if (!this.builderState.validateAllCards()) {
            this.logger.warn("Builder export blocked by validation failure");
            this.collapseBulkImport();
            this.scrollToFirstError();
            return;
        }

        const payload = this.builderState.getSerializedPayload();
        exportJSON(payload, "custom_quizset.json");
        this.logger.info("Builder quiz export completed", {
            questionCount: payload.length
        });
    }
}
