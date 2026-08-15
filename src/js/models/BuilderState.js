// ===========================
// --- BUILDER STATE MODEL ---
// ===========================

import { createLogger } from "../utils/logger.js";

/**
 * Core type dependencies for builder state management.
 * @typedef {import('../components/BuilderCardComponent.js').default} BuilderCardComponentType
 * @typedef {import('./QuizState.js').QuestionType} QuestionType
 */

/**
 * Manages the active form building session.
 * Retains a live array of BuilderCardComponent instances as the definitive source of truth.
 *
 * @class BuilderState
 * @name BuilderState
 * @version 1.3.1
 * @author Adam Ross DeStafeno
 * @property {BuilderCardComponentType[]} cards - Live array of instantiated builder components.
 */
export default class BuilderState {
    /**
     * Array of active builder card components.
     * @type {BuilderCardComponentType[]}
     */
    cards = [];

    /**
     * Initializes an empty internal array to track active builder components.
     * @name constructor
     * @public
     */
    constructor() {
        this.logger = createLogger("BuilderState");
        this.logger.info("constructor called");
        this.cards = [];
        this.logger.info("Builder state initialized", {
            cardCount: this.cards.length
        });
    }

    /**
     * Appends a new BuilderCardComponent instance to the active tracking array.
     * @name addCard
     * @public
     * @param {BuilderCardComponentType} card - The initialized component instance.
     * @returns {void} - Does not return a value.
     */
    addCard(card) {
        this.logger.info("addCard called", { card });
        this.logger.debug("Adding builder card", {
            existingCardCount: this.cards.length
        });
        this.cards.push(card);
        this.logger.info("Builder card added", {
            cardCount: this.cards.length
        });
    }

    /**
     * Evaluates the internal array to locate and purge the specific component instance, triggering its physical DOM destruction.
     * @name removeCard
     * @public
     * @param {BuilderCardComponentType} card - The specific component instance to purge.
     * @returns {void} - Does not return a value.
     */
    removeCard(card) {
        this.logger.info("removeCard called", { card });
        this.logger.debug("Removing builder card", {
            existingCardCount: this.cards.length
        });
        this.cards = this.cards.filter((c) => {
            this.logger.trace("removeCard: filterCallback", {
                c,
                matchesTarget: c === card
            });
            return c !== card;
        });
        card.destroy();
        this.logger.info("Builder card removed", {
            cardCount: this.cards.length
        });
    }

    /**
     * Forces the destruction of all tracked components and resets the internal tracking array to its baseline.
     * @name clearAll
     * @public
     * @returns {void} - Does not return a value.
     */
    clearAll() {
        this.logger.info("clearAll called", {
            existingCardCount: this.cards.length
        });
        this.logger.info("Clearing all builder cards", {
            cardCount: this.cards.length
        });
        this.cards.forEach((card) => {
            this.logger.trace("clearAll: destroyCallback", { card });
            card.destroy();
        });
        this.cards = [];
    }

    /**
     * Loops through all tracked components and forces them into a collapsed visual state to conserve viewport real estate.
     * @name collapseAllCards
     * @public
     * @returns {void} - Does not return a value.
     */
    collapseAllCards() {
        this.logger.info("collapseAllCards called", {
            cardCount: this.cards.length
        });
        this.logger.debug("Collapsing all builder cards", {
            cardCount: this.cards.length
        });
        this.cards.forEach((card) => {
            this.logger.trace("collapseAllCards: collapseCallback", { card });
            card.collapse();
        });
    }

    /**
     * Evaluates every active component to guarantee all structural requirements are met.
     * @name validateAllCards
     * @public
     * @returns {boolean} - True if all components report a valid state; otherwise false.
     */
    validateAllCards() {
        this.logger.info("validateAllCards called", {
            cardCount: this.cards.length
        });
        this.logger.debug("Validating all builder cards", {
            cardCount: this.cards.length
        });
        let isValid = true;

        /* Iterates across the memory stack to explicitly command each component to run its own localized validation checks. */
        // ----------------------------------------------------------------------
        this.cards.forEach((card) => {
            this.logger.trace("validateAllCards: validateCallback", { card });
            if (!card.validate()) {
                this.logger.warn("Validation failed for card component", {
                    card
                });
                isValid = false;
            }
        });
        // ----------------------------------------------------------------------
        this.logger.info("Builder card validation completed", { isValid });

        return isValid;
    }

    /**
     * Iterates across the entire memory stack, commanding each component to scrape its local data into a unified array object.
     * @name getSerializedPayload
     * @public
     * @returns {QuestionType[]} - The fully assembled assessment JSON.
     */
    getSerializedPayload() {
        this.logger.info("getSerializedPayload called", {
            cardCount: this.cards.length
        });
        this.logger.debug("Serializing builder payload", {
            cardCount: this.cards.length
        });

        /* Iterates sequentially to trigger localized data extraction and assemble the overarching payload for the router or export utility. */
        // ----------------------------------------------------------------------
        const payload = this.cards.flatMap((card) => {
            this.logger.trace("getSerializedPayload: serializeCallback", {
                card
            });
            const data = card.getCardData();
            return data ? [data] : [];
        });
        // ----------------------------------------------------------------------

        this.logger.info("Builder payload serialized", {
            questionCount: payload.length
        });

        return payload;
    }
}
