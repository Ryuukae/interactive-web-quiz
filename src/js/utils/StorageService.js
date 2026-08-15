import { createLogger } from "./logger.js";

/**
 * Architectural Responsibilities: Encapsulates all interactions with the browser's native localStorage API.
 * Encapsulation Scope: Provides a decoupled service layer for state models to persist data across page reloads.
 * @class StorageService
 * @version 1.3.1
 */
export default class StorageService {
    static logger = createLogger("StorageService");

    /**
     * Serializes data and writes it to localStorage.
     * @param {string} key - The localStorage key.
     * @param {any} data - The data to serialize and save.
     */
    static save(key, data) {
        this.logger.debug("save called", { key });
        try {
            const serialized = JSON.stringify(data);
            localStorage.setItem(key, serialized);
            this.logger.info("Data successfully saved to localStorage", {
                key
            });
        } catch (error) {
            this.logger.error(
                "StorageService error saving to localStorage",
                error
            );
        }
    }

    /**
     * Parses and returns data from localStorage.
     * @param {string} key - The localStorage key.
     * @returns {any|null} - The parsed data, or null if it doesn't exist or failed to parse.
     */
    static load(key) {
        this.logger.debug("load called", { key });
        try {
            const item = localStorage.getItem(key);
            if (!item) {
                this.logger.info("No cache found in localStorage", { key });
                return null;
            }
            this.logger.info("Cache successfully retrieved from localStorage", {
                key
            });
            return JSON.parse(item);
        } catch (error) {
            this.logger.error(
                "StorageService error loading from localStorage",
                error
            );
            return null;
        }
    }

    /**
     * Removes a specific item from localStorage.
     * @param {string} key - The localStorage key to remove.
     */
    static clear(key) {
        this.logger.debug("clear called", { key });
        try {
            localStorage.removeItem(key);
            this.logger.info("Cache successfully cleared from localStorage", {
                key
            });
        } catch (error) {
            this.logger.error(
                "StorageService error clearing localStorage",
                error
            );
        }
    }
}
