// ===========================
// --- BUILDER STATE MODEL ---
// ===========================

/**
 * @class BuilderState
 * @name BuilderState
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
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
     * @returns {void} - Does not return a value.
     */
    constructor() {
        this.cards = [];
    }

    /**
     * @name addCard
     * @public
     * @description Appends a new BuilderCardComponent instance to the active tracking array.
     * @param {BuilderCardComponent} card - The initialized component instance.
     * @returns {void} - Does not return a value.
     */
    addCard(card) {
        this.cards.push(card);
    }

    /**
     * @name removeCard
     * @public
     * @description Evaluates the internal array to locate and purge the specific component instance, triggering its physical DOM destruction.
     * @param {BuilderCardComponent} card - The specific component instance to purge.
     * @returns {void} - Does not return a value.
     */
    removeCard(card) {
        this.cards = this.cards.filter(c => c !== card);
        card.destroy();
    }

    /**
     * @name clearAll
     * @public
     * @description Forces the destruction of all tracked components and resets the internal tracking array to its baseline.
     * @returns {void} - Does not return a value.
     */
    clearAll() {
        this.cards.forEach(card => card.destroy());
        this.cards = [];
    }

    /**
     * @name collapseAllCards
     * @public
     * @description Loops through all tracked components and forces them into a collapsed visual state to conserve viewport real estate.
     * @returns {void} - Does not return a value.
     */
    collapseAllCards() {
        this.cards.forEach(card => card.collapse());
    }

    /**
     * @name validateAllCards
     * @public
     * @description Evaluates every active component to guarantee all structural requirements are met.
     * @returns {boolean} - True if all components report a valid state; otherwise false.
     */
    validateAllCards() {
        let isValid = true;
        
        /* Iterates across the memory stack to explicitly command each component to run its own localized validation checks. */
        // ----------------------------------------------------------------------
        this.cards.forEach(card => {
            if (!card.validate()) {
                isValid = false;
            }
        });
        // ----------------------------------------------------------------------
        
        return isValid;
    }

    /**
     * @name getSerializedPayload
     * @public
     * @description Iterates across the entire memory stack, commanding each component to scrape its local data into a unified array object.
     * @returns {Array<Object>} - The fully assembled assessment JSON.
     */
    getSerializedPayload() {
        const payload = [];
        
        /* Iterates sequentially to trigger localized data extraction and assemble the overarching payload for the router or export utility. */
        // ----------------------------------------------------------------------
        this.cards.forEach(card => {
            const data = card.getCardData();
            if (data) {
                payload.push(data);
            }
        });
        // ----------------------------------------------------------------------
        
        return payload;
    }
}