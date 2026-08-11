// ===========================
// --- BUILDER STATE MODEL ---
// ===========================

import { createLogger } from "../utils/logger.js";

/**
 * @typedef {import('../components/BuilderCardComponent.js').default} BuilderCardComponentType
 */

/**
 * @class BuilderState
 * @name BuilderState
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
 * @property {BuilderCardComponentType[]} cards - Live array of instantiated builder components.
 * @description
 * Architectural Responsibilities: Manages the active form building session. Retains a live array of BuilderCardComponent instances in memory to act as the definitive source of truth, completely detaching data from the physical DOM layout.
 *
 * Encapsulation Scope: Isolated execution state strictly for a single active form builder session.
 */
export default class BuilderState {
    /**
     * @name constructor
     * @public
     * @description Initializes an empty internal array to track active builder components.
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
     * @name addCard
     * @public
     * @description Appends a new BuilderCardComponent instance to the active tracking array.
     * @param {BuilderCardComponent} card - The initialized component instance.
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
     * @name removeCard
     * @public
     * @description Evaluates the internal array to locate and purge the specific component instance, triggering its physical DOM destruction.
     * @param {BuilderCardComponent} card - The specific component instance to purge.
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
     * @name clearAll
     * @public
     * @description Forces the destruction of all tracked components and resets the internal tracking array to its baseline.
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
     * @name collapseAllCards
     * @public
     * @description Loops through all tracked components and forces them into a collapsed visual state to conserve viewport real estate.
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
     * @name validateAllCards
     * @public
     * @description Evaluates every active component to guarantee all structural requirements are met.
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
     * @name getSerializedPayload
     * @public
     * @description Iterates across the entire memory stack, commanding each component to scrape its local data into a unified array object.
     * @returns {Array<object>} - The fully assembled assessment JSON.
     */
    getSerializedPayload() {
        this.logger.info("getSerializedPayload called", {
            cardCount: this.cards.length
        });
        this.logger.debug("Serializing builder payload", {
            cardCount: this.cards.length
        });
        const payload = [];

        /* Iterates sequentially to trigger localized data extraction and assemble the overarching payload for the router or export utility. */
        // ----------------------------------------------------------------------
        this.cards.forEach((card) => {
            this.logger.trace("getSerializedPayload: serializeCallback", {
                card
            });
            const data = card.getCardData();
            if (data) {
                payload.push(data);
            }
        });
        // ----------------------------------------------------------------------

        this.logger.info("Builder payload serialized", {
            questionCount: payload.length
        });

        return payload;
    }
}
