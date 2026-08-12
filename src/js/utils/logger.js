/**
 * Provides internal functionality.
 * @typedef {"trace"|"debug"|"info"|"warn"|"error"|"silent"} LogLevel
 */

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
 * Provides internal functionality.
 * @param {string | undefined | null} level - The log level to normalize
 * @returns {LogLevel} - The normalized log level
 */
function normalizeLevel(level) {
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
 * Provides internal functionality.
 * @returns {LogLevel} - The active log level
 */
function getActiveLevel() {
    if (typeof window !== "undefined" && window.localStorage) {
        const storedLevel = window.localStorage.getItem(STORAGE_KEY);
        if (storedLevel) {
            return normalizeLevel(storedLevel);
        }
    }

    return DEFAULT_LEVEL;
}

/**
 * Provides internal functionality.
 * @param {LogLevel} level - The log level to check
 * @returns {boolean} - Whether logging should occur
 */
function shouldLog(level) {
    return LEVELS[level] >= LEVELS[getActiveLevel()];
}

/**
 * Provides internal functionality.
 * @param {any} value - The value to serialize
 * @returns {any} - The serialized value
 */
function serializeValue(value) {
    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            stack: value.stack
        };
    }

    if (Array.isArray(value)) {
        return value.map((item) => serializeValue(item));
    }

    if (value && typeof value === "object") {
        const entries = Object.entries(value).map(([key, entry]) => {
            if (typeof entry === "function") {
                return [key, `[Function ${entry.name || "anonymous"}]`];
            }
            return [key, serializeValue(entry)];
        });
        return Object.fromEntries(entries);
    }

    return value;
}

/**
 * Provides internal functionality.
 * @param {LogLevel} level - The log level
 * @param {string} scope - The logger scope
 * @param {string} message - The log message
 * @param {any} [details] - Optional log details
 * @returns {void} - No return value
 */
function emit(level, scope, message, details) {
    if (!shouldLog(level)) {
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

    consoleMethod(prefix, serializeValue(details));
}

/**
 * Provides internal functionality.
 * @param {string} scope - The scope of the logger
 * @returns {Record<string, Function>} - The logger instance
 */
export function createLogger(scope) {
    return {
        /**
         * Provides internal functionality.
         * @param {string} message - The log message
         * @param {any} [details] - Optional log details
         */
        trace(message, details) {
            emit("trace", scope, message, details);
        },
        /**
         * Provides internal functionality.
         * @param {string} message - The log message
         * @param {any} [details] - Optional log details
         */
        debug(message, details) {
            emit("debug", scope, message, details);
        },
        /**
         * Provides internal functionality.
         * @param {string} message - The log message
         * @param {any} [details] - Optional log details
         */
        info(message, details) {
            emit("info", scope, message, details);
        },
        /**
         * Provides internal functionality.
         * @param {string} message - The log message
         * @param {any} [details] - Optional log details
         */
        warn(message, details) {
            emit("warn", scope, message, details);
        },
        /**
         * Provides internal functionality.
         * @param {string} message - The log message
         * @param {any} [details] - Optional log details
         */
        error(message, details) {
            emit("error", scope, message, details);
        },
        /**
         * Provides internal functionality.
         * @param {string} childScope - The child scope
         * @returns {object} - A child logger instance
         */
        child(childScope) {
            return createLogger(`${scope}.${childScope}`);
        }
    };
}

/**
 * Provides internal functionality.
 * @returns {LogLevel} - The current log level
 */
export function getLogLevel() {
    return getActiveLevel();
}

/**
 * Provides internal functionality.
 * @param {string} level - The log level to set
 * @returns {LogLevel} - The normalized set log level
 */
export function setLogLevel(level) {
    const normalized = normalizeLevel(level);

    if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, normalized);
    }

    return normalized;
}
