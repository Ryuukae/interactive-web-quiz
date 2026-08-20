import { createLogger } from "./logger.js";

const logger = createLogger("StorageService");

/**
 * Provides a decoupled service layer encapsulating all interactions with the native localStorage API.
 *
 * @class StorageService
 * @version 1.6.0
 * @author Adam Ross DeStafeno
 */
export default class StorageService {
  /**
   * Serializes data and writes it to localStorage.
   * @param {string} key - The localStorage key.
   * @param {any} data - The data to serialize and save.
   * @returns {void}
   */
  static save(key, data) {
    logger.info("save called", { key });
    logger.debug("Serializing and writing data to localStorage", {
      key,
      dataType: typeof data
    });
    try {
      const serialized = JSON.stringify(data);
      localStorage.setItem(key, serialized);
      logger.info("Data successfully saved to localStorage", { key });
      logger.debug("Write operation completed", { key });
    } catch (error) {
      logger.error("StorageService error saving to localStorage", error);
    }
  }

  /**
   * Parses and returns data from localStorage.
   * @param {string} key - The localStorage key.
   * @returns {any|null} - The parsed data, or null if it doesn't exist or failed to parse.
   */
  static load(key) {
    logger.info("load called", { key });
    logger.debug("Reading data from localStorage", { key });
    try {
      const item = localStorage.getItem(key);
      if (!item) {
        logger.info("No cache found in localStorage", { key });
        logger.debug("Item not present in storage", { key });
        return null;
      }
      logger.info("Cache successfully retrieved from localStorage", { key });
      logger.debug("Item parsed successfully", { key });
      return JSON.parse(item);
    } catch (error) {
      logger.error("StorageService error loading from localStorage", error);
      return null;
    }
  }

  /**
   * Removes a specific item from localStorage.
   * @param {string} key - The localStorage key to remove.
   * @returns {void}
   */
  static clear(key) {
    logger.info("clear called", { key });
    logger.debug("Removing item from localStorage", { key });
    try {
      localStorage.removeItem(key);
      logger.info("Cache successfully cleared from localStorage", { key });
      logger.debug("Item removed from storage", { key });
    } catch (error) {
      logger.error("StorageService error clearing localStorage", error);
    }
  }
}
