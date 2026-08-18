import { createLogger } from "./logger.js";

/**
 * Utility module wrapping native browser dialogs for protective user interactions.
 * Provides a unified interface for confirmation and alert prompts.
 *
 * @module prompts
 * @version 1.5.2
 * @author Adam Ross DeStafeno
 */

/**
 * Halts the execution thread natively to ask the user for explicit boolean confirmation visually.
 * @name confirmAction
 * @public
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
 * Halts the execution thread natively to display a strict warning to the user explicitly.
 * @name alertAction
 * @public
 * @param {string} message - The custom alert text to display seamlessly.
 * @returns {void} - Does not return a value.
 */
export function alertAction(message) {
  const logger = createLogger("prompts.alertAction");
  logger.info("alertAction called", { message });
  logger.warn("Alert prompt displayed to user", { message });
  window.alert(message);
}
