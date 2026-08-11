import { createLogger } from './logger.js';

/**
 * @module templates
 * @version 1.0.0
 * @author Adam Ross DeStafeno
 * @since 2026-08-08
 * @description 
 * Architectural Responsibilities: Houses static string payloads for injection into user-facing text areas to assist with syntax formatting.
 * 
 * Encapsulation Scope: Global utility. Provides read-only data string generation natively.
 */

/**
 * @name getJsonTemplate
 * @public
 * @description Generates a structural JSON template payload dynamically.
 * @returns {string} - The formatted JSON blueprint natively.
 */
export function getJsonTemplate() {
    const logger = createLogger("templates.getJsonTemplate");
    logger.info("getJsonTemplate called");
    const template = `[\n  {\n    "question": "",\n    "answers": [\n      { "text": "", "correct": true },\n      { "text": "", "correct": false }\n    ]\n  }\n]`;
    logger.debug("Returning JSON template string", { length: template.length });
    return template;
}

/**
 * @name getTxtTemplate
 * @public
 * @description Generates a structural plain-text QAD template payload dynamically.
 * @returns {string} - The formatted TXT blueprint natively.
 */
export function getTxtTemplate() {
    const logger = createLogger("templates.getTxtTemplate");
    logger.info("getTxtTemplate called");
    const template = `q=\na=\nd=\n`;
    logger.debug("Returning TXT QAD template string", { length: template.length });
    return template;
}