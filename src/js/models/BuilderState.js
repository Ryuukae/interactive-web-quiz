import { createLogger } from "../utils/logger.js";

const logger = createLogger("BuilderState");

/**
 * Manages the active form building session.
 * Retains a live array of BuilderCardComponent instances as the definitive source of truth.
 *
 * @class BuilderState
 * @name BuilderState
 * @version 1.6.1
 * @author Adam Ross DeStafeno
 * @property {BuilderCardComponentType[]} cards - Live array of instantiated builder components.
 * @property {QuestionType[]} questions - Live array of instantiated question components.
 * @typedef {import('../types.js').BuilderCardComponentType} BuilderCardComponentType
 * @typedef {import('../types.js').QuestionType} QuestionType
 */
export default class BuilderState {
  /**
   * Initializes an empty internal array to track active builder components.
   * @name constructor
   * @public
   */
  constructor() {
    logger.info("constructor called");
    logger.debug("Initializing BuilderState tracking arrays");

    // Inline casting forces the engine to recognize the empty arrays
    this.cards = /** @type {BuilderCardComponentType[]} */ ([]);
    this.questions = /** @type {QuestionType[]} */ ([]);

    logger.info("Builder state initialized", {
      cardCount: this.cards.length
    });
    logger.debug("BuilderState initialized with empty card arrays");
  }

  /**
   * Appends a new BuilderCardComponent instance to the active tracking array.
   * @name addCard
   * @public
   * @param {BuilderCardComponentType} card - The initialized component instance.
   * @returns {void} - Does not return a value.
   */
  addCard(card) {
    logger.info("addCard called", { card });
    logger.debug("Adding builder card", {
      existingCardCount: this.cards.length
    });
    this.cards.push(card);
    logger.info("Builder card added", {
      cardCount: this.cards.length
    });
    logger.debug("Card pushed to builderState tracking array", {
      newCount: this.cards.length
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
    logger.info("removeCard called", { card });
    logger.debug("Removing builder card", {
      existingCardCount: this.cards.length
    });
    this.cards = this.cards.filter((c) => {
      logger.trace("removeCard: filterCallback", {
        c,
        matchesTarget: c === card
      });
      return c !== card;
    });
    card.destroy();
    logger.info("Builder card removed", {
      cardCount: this.cards.length
    });
    logger.debug("Card destroyed and purged from state", {
      remainingCount: this.cards.length
    });
  }

  /**
   * Forces the destruction of all tracked components and resets the internal tracking array to its baseline.
   * @name clearAll
   * @public
   * @returns {void} - Does not return a value.
   */
  clearAll() {
    logger.info("clearAll called", {
      existingCardCount: this.cards.length
    });
    logger.debug("Clearing all builder cards", {
      cardCount: this.cards.length
    });
    this.cards.forEach((card) => {
      logger.trace("clearAll: destroyCallback", { card });
      card.destroy();
    });
    this.cards = [];
    logger.info("All builder cards cleared");
    logger.debug("BuilderState cards array reset to empty");
  }

  /**
   * Loops through all tracked components and forces them into a collapsed visual state to conserve viewport real estate.
   * @name collapseAllCards
   * @public
   * @returns {void} - Does not return a value.
   */
  collapseAllCards() {
    logger.info("collapseAllCards called", {
      cardCount: this.cards.length
    });
    logger.debug("Collapsing all builder cards", {
      cardCount: this.cards.length
    });
    this.cards.forEach((card) => {
      logger.trace("collapseAllCards: collapseCallback", { card });
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
    logger.info("validateAllCards called", {
      cardCount: this.cards.length
    });
    logger.debug("Validating all builder cards", {
      cardCount: this.cards.length
    });
    let isValid = true;

    /* Iterates across the memory stack to explicitly command each component to run its own localized validation checks. */
    // ----------------------------------------------------------------------
    this.cards.forEach((card) => {
      logger.trace("validateAllCards: validateCallback", { card });
      if (!card.validate()) {
        logger.warn("Validation failed for card component", {
          card
        });
        isValid = false;
      }
    });
    // ----------------------------------------------------------------------
    logger.info("Builder card validation completed", { isValid });
    logger.debug("Validation result calculated for cards", { isValid });

    return isValid;
  }

  /**
   * Iterates across the entire memory stack, commanding each component to scrape its local data into a unified array object.
   * @name getSerializedPayload
   * @public
   * @returns {QuestionType[]} - The fully assembled assessment JSON.
   */
  getSerializedPayload() {
    logger.info("getSerializedPayload called", {
      cardCount: this.cards.length
    });
    logger.debug("Serializing builder payload", {
      cardCount: this.cards.length
    });

    /* Iterates sequentially to trigger localized data extraction and assemble the overarching payload for the router or export utility. */
    // ----------------------------------------------------------------------
    const payload = this.cards.flatMap((card) => {
      logger.trace("getSerializedPayload: serializeCallback", {
        card
      });
      const data = card.getCardData();
      return data ? [data] : [];
    });
    // ----------------------------------------------------------------------

    logger.info("Builder payload serialized", {
      questionCount: payload.length
    });
    logger.debug("Serialized question data extracted from all cards", {
      count: payload.length
    });

    return payload;
  }
}
