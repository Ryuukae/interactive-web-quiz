import { getTxtTemplate, getJsonTemplate } from '../utils/templates.js';
import { confirmAction, alertAction } from '../utils/prompts.js';
import { exportJSON } from '../utils/fileIO.js';
import { parseAndValidateRawText } from '../utils/schemaValidator.js';
import BuilderCardComponent from '../components/BuilderCardComponent.js';

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
     * @name constructor
     * @public
     * @description Links physical nodes with Model authorities cleanly.
     * @param {BuilderState} builderState - The central tracker modeling card components natively.
     * @param {QuizUIController} quizUIController - Exposed for direct bypass assessment triggers explicitly.
     * @param {AppNavigationController} appNavController - Coordinates manual routing assignments optimally.
     * @returns {void} - Does not return a value.
     */
    constructor(builderState, quizUIController, appNavController) {
        this.builderState = builderState;
        this.quizUIController = quizUIController;
        this.appNavController = appNavController;

        this.builderContainer = document.getElementById("builder-questions-container");
        this.bulkImportPanel = document.getElementById("bulk-import-panel");
        this.bulkImportText = document.getElementById("bulk-import-text");
        this.bulkImportStatus = document.getElementById("bulk-import-status");

        this.initializeEventListeners();
    }

    /**
     * @name initializeEventListeners
     * @public
     * @description Hooks physical actions explicitly to bounded component workflows and logical routines securely.
     * @returns {void} - Does not return a value.
     */
    initializeEventListeners() {
        document.getElementById("create-quizset-btn").addEventListener("click", () => {
            this.initializeBuilder();
        });

        document.getElementById("btn-add-question").addEventListener("click", () => {
            this.handleAddQuestion();
        });
        
        document.getElementById("btn-run-builder-quiz").addEventListener("click", () => {
            this.startBuilderQuiz();
        });

        document.getElementById("btn-export-quiz").addEventListener("click", () => {
            this.exportBuilderQuiz();
        });

        document.getElementById("btn-parse-bulk").addEventListener("click", () => {
            this.handleBulkImport();
        });

        document.getElementById("bulk-import-header").addEventListener("click", () => {
            const isNowCollapsed = this.bulkImportPanel.classList.toggle("collapsed");
            if (!isNowCollapsed) {
                this.builderState.collapseAllCards();
            }
        });

        document.getElementById("btn-template-txt").addEventListener("click", () => {
            if (this.bulkImportText.value.trim() !== "") {
                if (!confirmAction("Inserting this template will overwrite your current text. Do you wish to continue?")) return;
            }
            this.bulkImportText.value = getTxtTemplate();
        });
        
        document.getElementById("btn-template-json").addEventListener("click", () => {
            if (this.bulkImportText.value.trim() !== "") {
                if (!confirmAction("Inserting this template will overwrite your current text. Do you wish to continue?")) return;
            }
            this.bulkImportText.value = getJsonTemplate();
        });

        document.getElementById("btn-clear-builder").addEventListener("click", () => {
            if (this.builderState.cards.length === 0) return;
            if (confirmAction("Are you sure you want to clear all questions? This action cannot be undone.")) {
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
        if (!this.bulkImportPanel.classList.contains("collapsed")) {
            this.bulkImportPanel.classList.add("collapsed");
        }
    }

    /**
     * @name scrollToFirstError
     * @public
     * @description Locates the first validation error within the builder container and scrolls it smoothly into the viewport.
     * @returns {void} - Does not return a value.
     */
    scrollToFirstError() {
        /* Defers execution briefly to ensure DOM paint mapping is completed prior to scroll interception natively. */
        // ----------------------------------------------------------------------
        setTimeout(() => {
            const firstError = this.builderContainer.querySelector('.input-error');
            if (firstError) {
                firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
        this.builderState.clearAll();
        
        const newCard = new BuilderCardComponent(
            null, 
            (card) => this.builderState.removeCard(card),
            () => this.collapseBulkImport()
        );
        this.builderState.addCard(newCard);
        this.builderContainer.appendChild(newCard.node);
    }

    /**
     * @name handleAddQuestion
     * @public
     * @description Safeguards validation protocols natively, collapsing active visual tracks, triggering strict node generation, and scrolling into bounded zones systematically.
     * @returns {void} - Does not return a value.
     */
    handleAddQuestion() {
        /* Encapsulates the execution chain to strictly block execution mapping errors while preserving physical viewport alignment properties dynamically. */
        // ----------------------------------------------------------------------
        if (!this.builderState.validateAllCards()) {
            this.scrollToFirstError();
            return;
        }

        this.collapseBulkImport();
        this.builderState.collapseAllCards();
        
        const newCard = new BuilderCardComponent(
            null, 
            (card) => this.builderState.removeCard(card),
            () => this.collapseBulkImport()
        );
        this.builderState.addCard(newCard);
        this.builderContainer.appendChild(newCard.node);
        
        setTimeout(() => {
            this.builderContainer.scrollTo({
                top: this.builderContainer.scrollHeight,
                behavior: "smooth"
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
        const rawText = this.bulkImportText.value;

        if (!rawText.trim()) return;

        this.bulkImportStatus.classList.remove("error", "visible");
        this.bulkImportStatus.textContent = "";

        try {
            /* Parses and validates the raw text string to construct formatted question payloads seamlessly. */
            // ----------------------------------------------------------------------
            const parsedData = parseAndValidateRawText(rawText);
            
            parsedData.forEach(q => {
                const newCard = new BuilderCardComponent(
                    q, 
                    (card) => this.builderState.removeCard(card),
                    () => this.collapseBulkImport()
                );
                this.builderState.addCard(newCard);
                this.builderContainer.appendChild(newCard.node);
            });
            // ----------------------------------------------------------------------
            
            this.bulkImportText.value = "";
            
            setTimeout(() => {
                this.builderContainer.scrollTo({
                    top: this.builderContainer.scrollHeight,
                    behavior: "smooth"
                });
            }, 50);
            
        } catch (error) {
            console.error("Bulk parsing failed:", error);
            this.bulkImportStatus.textContent = `Error: ${error.message}`;
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
        if (this.builderState.cards.length === 0) {
            alertAction("Please add at least one question before starting the quiz.");
            return;
        }

        if (!this.builderState.validateAllCards()) {
            this.scrollToFirstError();
            return;
        }

        const payload = this.builderState.getSerializedPayload();
        
        if (payload.length === 0) {
            alertAction("Please complete at least one question before starting.");
            return;
        }

        this.quizUIController.loadCustomQuiz(payload);
    }

    /**
     * @name exportBuilderQuiz
     * @public
     * @description Scrapes localized logical states explicitly against output algorithms seamlessly physically.
     * @returns {void} - Does not return a value.
     */
    exportBuilderQuiz() {
        if (this.builderState.cards.length === 0) {
            alertAction("Please add at least one question before exporting.");
            return;
        }

        if (!this.builderState.validateAllCards()) {
            this.scrollToFirstError();
            return;
        }

        const payload = this.builderState.getSerializedPayload();
        exportJSON(payload, "custom_quizset.json");
    }
}