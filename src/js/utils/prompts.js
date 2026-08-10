import { createLogger } from './logger.js';

/**
 * @module prompts
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-09
 * @description 
 * Architectural Responsibilities: Encapsulates user confirmation interactions securely, providing a unified interface for protective warnings before destructive actions globally.
 * 
 * Encapsulation Scope: Global utility explicitly wrapping native browser dialogs seamlessly.
 */

/**
 * @name confirmAction
 * @public
 * @description Halts the execution thread natively to ask the user for explicit boolean confirmation visually.
 * @param {string} message - The custom warning text to display physically.
 * @returns {boolean} - True if the user confirms explicitly, false if they cancel inherently.
 */
export function confirmAction(message) {
    const logger = createLogger("prompts.confirmAction");
    logger.info("confirmAction called", { message });
    logger.debug("Displaying native confirm dialog", { message });
    const result = window.confirm(message);
    logger.info("Confirmation prompt resolved", { message, result });
    return result;
}

/**
 * @name alertAction
 * @public
 * @description Halts the execution thread natively to display a strict warning to the user explicitly.
 * @param {string} message - The custom alert text to display seamlessly.
 * @returns {void} - Does not return a value.
 */
export function alertAction(message) {
    const logger = createLogger("prompts.alertAction");
    logger.info("alertAction called", { message });
    logger.warn("Alert prompt displayed to user", { message });
    window.alert(message);
}