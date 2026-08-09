// ======================
// --- PROMPTS MODULE ---
// ======================

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
    return window.confirm(message);
}

/**
 * @name alertAction
 * @public
 * @description Halts the execution thread natively to display a strict warning to the user explicitly.
 * @param {string} message - The custom alert text to display seamlessly.
 * @returns {void} - Does not return a value.
 */
export function alertAction(message) {
    window.alert(message);
}

