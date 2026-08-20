import { createLogger } from "./logger.js";

const logger = createLogger("templates");

/**
 * Global utility module housing static string payloads.
 * Provides read-only template generation for injection into user-facing text areas.
 *
 * @module templates
 * @version 1.6.0
 * @author Adam Ross DeStafeno
 */

/**
 * Generates a structural JSON template payload dynamically.
 * @name getJsonTemplate
 * @public
 * @returns {string} - The formatted JSON blueprint natively.
 */
export function getJsonTemplate() {
  logger.info("getJsonTemplate called");
  const template = `[\n  {\n    "question": "",\n    "answers": [\n      { "text": "", "correct": true },\n      { "text": "", "correct": false }\n    ]\n  }\n]`;
  logger.debug("Returning JSON template string", { length: template.length });
  return template;
}

/**
 * Generates a structural plain-text QAD template payload dynamically.
 * @name getTxtTemplate
 * @public
 * @returns {string} - The formatted TXT blueprint natively.
 */
export function getTxtTemplate() {
  logger.info("getTxtTemplate called");
  const template = `Q=""\nA=""\nD=""\n`;
  logger.debug("Returning TXT QAD template string", {
    length: template.length
  });
  return template;
}
