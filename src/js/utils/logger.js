const LEVELS = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  silent: 5
};

const STORAGE_KEY = "interactive-web-quiz:logLevel";
const DEFAULT_LEVEL = "info";

/**
 * Centralized logging utility class providing structured, leveled console output across the application.
 *
 * @class Logger
 * @name Logger
 * @version 1.6.1
 * @author Adam Ross DeStafeno
 * @property {string} scope - The scoped identifier prefixing all emitted logs.
 * @typedef {import('../types.js').LogLevel} LogLevel
 */
export default class Logger {
  /**
   * Initializes a new Logger instance bound to a specific scope.
   * @name constructor
   * @public
   * @param {string} scope - The identifier for this logger instance.
   */
  constructor(scope) {
    this.scope = scope;
  }

  /**
   * Normalizes an arbitrary string into a valid log level threshold.
   * @name normalizeLevel
   * @public
   * @static
   * @param {string | undefined | null} level - The log level string to normalize.
   * @returns {LogLevel} - The validated, normalized log level.
   */
  static normalizeLevel(level) {
    const normalized = String(level || "").toLowerCase();
    switch (normalized) {
      case "trace":
      case "debug":
      case "info":
      case "warn":
      case "error":
      case "silent":
        return normalized;
      default:
        return DEFAULT_LEVEL;
    }
  }

  /**
   * Retrieves the currently active log level from local storage or falls back to default.
   * @name getActiveLevel
   * @public
   * @static
   * @returns {LogLevel} - The active log level threshold.
   */
  static getActiveLevel() {
    if (typeof window !== "undefined" && window.localStorage) {
      const storedLevel = window.localStorage.getItem(STORAGE_KEY);
      if (storedLevel) {
        return Logger.normalizeLevel(storedLevel);
      }
    }
    return DEFAULT_LEVEL;
  }

  /**
   * Determines if a given log level meets or exceeds the active threshold.
   * @name shouldLog
   * @public
   * @static
   * @param {LogLevel} level - The log level to check.
   * @returns {boolean} - True if logging should proceed, false otherwise.
   */
  static shouldLog(level) {
    return LEVELS[level] >= LEVELS[Logger.getActiveLevel()];
  }

  /**
   * Safely serializes objects, errors, and functions for structured console output.
   * @name serializeValue
   * @public
   * @static
   * @param {any} value - The value to serialize.
   * @returns {any} - The sanitized, serializable value.
   */
  static serializeValue(value) {
    if (value instanceof Error) {
      return {
        name: value.name,
        message: value.message,
        stack: value.stack
      };
    }

    if (Array.isArray(value)) {
      return value.map((item) => Logger.serializeValue(item));
    }

    if (value && typeof value === "object") {
      const entries = Object.entries(value).map(([key, entry]) => {
        if (typeof entry === "function") {
          return [key, `[Function ${entry.name || "anonymous"}]`];
        }
        return [key, Logger.serializeValue(entry)];
      });
      return Object.fromEntries(entries);
    }

    return value;
  }

  /**
   * Formats and outputs the log message to the appropriate console method.
   * @name emit
   * @public
   * @static
   * @param {LogLevel} level - The log level of the message.
   * @param {string} scope - The logger scope name.
   * @param {string} message - The primary log message text.
   * @param {any} [details] - Optional structured metadata or error payload.
   * @returns {void}
   */
  static emit(level, scope, message, details) {
    if (!Logger.shouldLog(level)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${scope}] ${message}`;

    let consoleMethod = console.log;
    switch (level) {
      case "trace":
        consoleMethod = console.trace;
        break;
      case "debug":
        consoleMethod = console.debug;
        break;
      case "info":
        consoleMethod = console.info;
        break;
      case "warn":
        consoleMethod = console.warn;
        break;
      case "error":
        consoleMethod = console.error;
        break;
    }

    if (typeof details === "undefined") {
      consoleMethod(prefix);
      return;
    }

    consoleMethod(prefix, Logger.serializeValue(details));
  }

  /**
   * Emits a trace level log message for low-level execution details.
   * @name trace
   * @public
   * @param {string} message - The primary log message.
   * @param {any} [details] - Optional metadata payload.
   * @returns {void}
   */
  trace(message, details) {
    Logger.emit("trace", this.scope, message, details);
  }

  /**
   * Emits a debug level log message for internal state and diagnostic data.
   * @name debug
   * @public
   * @param {string} message - The primary log message.
   * @param {any} [details] - Optional metadata payload.
   * @returns {void}
   */
  debug(message, details) {
    Logger.emit("debug", this.scope, message, details);
  }

  /**
   * Emits an info level log message for general operational milestones.
   * @name info
   * @public
   * @param {string} message - The primary log message.
   * @param {any} [details] - Optional metadata payload.
   * @returns {void}
   */
  info(message, details) {
    Logger.emit("info", this.scope, message, details);
  }

  /**
   * Emits a warn level log message for unexpected conditions or recoverable issues.
   * @name warn
   * @public
   * @param {string} message - The primary log message.
   * @param {any} [details] - Optional metadata payload.
   * @returns {void}
   */
  warn(message, details) {
    Logger.emit("warn", this.scope, message, details);
  }

  /**
   * Emits an error level log message for runtime failures and caught exceptions.
   * @name error
   * @public
   * @param {string} message - The primary log message.
   * @param {any} [details] - Optional error or metadata payload.
   * @returns {void}
   */
  error(message, details) {
    Logger.emit("error", this.scope, message, details);
  }

  /**
   * Creates a nested child logger inheriting this logger's scope prefix.
   * @name child
   * @public
   * @param {string} childScope - The child scope sub-identifier.
   * @returns {Logger} - A new child Logger instance.
   */
  child(childScope) {
    return new Logger(`${this.scope}.${childScope}`);
  }
}

/**
 * Creates a scoped Logger instance.
 * @name createLogger
 * @public
 * @param {string} scope - The scope identifier for the logger.
 * @returns {Logger} - A new Logger instance.
 */
export function createLogger(scope) {
  return new Logger(scope);
}

/**
 * Returns the currently active application log level.
 * @name getLogLevel
 * @public
 * @returns {LogLevel} - The current log level.
 */
export function getLogLevel() {
  return Logger.getActiveLevel();
}

/**
 * Persists and applies a new active log level threshold to local storage.
 * @name setLogLevel
 * @public
 * @param {string} level - The log level to set.
 * @returns {LogLevel} - The normalized set log level.
 */
export function setLogLevel(level) {
  const normalized = Logger.normalizeLevel(level);

  if (typeof window !== "undefined" && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY, normalized);
  }

  return normalized;
}
