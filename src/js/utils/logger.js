/**
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
 * @param {string | undefined | null} level
 * @returns {LogLevel}
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
 * @returns {LogLevel}
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
 * @param {LogLevel} level
 * @returns {boolean}
 */
function shouldLog(level) {
    return LEVELS[level] >= LEVELS[getActiveLevel()];
}

/**
 * @param {any} value
 * @returns {any}
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
 * @param {LogLevel} level
 * @param {string} scope
 * @param {string} message
 * @param {any} [details]
 * @returns {void}
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
 * @param {string} scope
 * @returns {Record<string, Function>}
 */
export function createLogger(scope) {
    return {
        /**
         * @param {string} message
         * @param {any} [details]
         */
        trace(message, details) {
            emit("trace", scope, message, details);
        },
        /**
         * @param {string} message
         * @param {any} [details]
         */
        debug(message, details) {
            emit("debug", scope, message, details);
        },
        /**
         * @param {string} message
         * @param {any} [details]
         */
        info(message, details) {
            emit("info", scope, message, details);
        },
        /**
         * @param {string} message
         * @param {any} [details]
         */
        warn(message, details) {
            emit("warn", scope, message, details);
        },
        /**
         * @param {string} message
         * @param {any} [details]
         */
        error(message, details) {
            emit("error", scope, message, details);
        },
        /**
         * @param {string} childScope
         */
        child(childScope) {
            return createLogger(`${scope}.${childScope}`);
        }
    };
}

/**
 * @returns {LogLevel}
 */
export function getLogLevel() {
    return getActiveLevel();
}

/**
 * @param {string} level
 * @returns {LogLevel}
 */
export function setLogLevel(level) {
    const normalized = normalizeLevel(level);

    if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, normalized);
    }

    return normalized;
}
