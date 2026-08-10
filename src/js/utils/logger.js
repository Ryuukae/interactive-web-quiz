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

function normalizeLevel(level) {
    const normalized = String(level || "").toLowerCase();
    return Object.prototype.hasOwnProperty.call(LEVELS, normalized) ? normalized : DEFAULT_LEVEL;
}

function getActiveLevel() {
    if (typeof window !== "undefined" && window.localStorage) {
        const storedLevel = window.localStorage.getItem(STORAGE_KEY);
        if (storedLevel) {
            return normalizeLevel(storedLevel);
        }
    }

    return DEFAULT_LEVEL;
}

function shouldLog(level) {
    return LEVELS[level] >= LEVELS[getActiveLevel()];
}

function serializeValue(value) {
    if (value instanceof Error) {
        return {
            name: value.name,
            message: value.message,
            stack: value.stack
        };
    }

    if (Array.isArray(value)) {
        return value.map(item => serializeValue(item));
    }

    if (value && typeof value === "object") {
        const output = {};

        for (const [key, entry] of Object.entries(value)) {
            if (typeof entry === "function") {
                output[key] = `[Function ${entry.name || "anonymous"}]`;
                continue;
            }

            output[key] = serializeValue(entry);
        }

        return output;
    }

    return value;
}

function emit(level, scope, message, details) {
    if (!shouldLog(level)) {
        return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${scope}] ${message}`;
    const consoleMethod = console[level] || console.log;

    if (typeof details === "undefined") {
        consoleMethod(prefix);
        return;
    }

    consoleMethod(prefix, serializeValue(details));
}

export function createLogger(scope) {
    return {
        trace(message, details) {
            emit("trace", scope, message, details);
        },
        debug(message, details) {
            emit("debug", scope, message, details);
        },
        info(message, details) {
            emit("info", scope, message, details);
        },
        warn(message, details) {
            emit("warn", scope, message, details);
        },
        error(message, details) {
            emit("error", scope, message, details);
        },
        child(childScope) {
            return createLogger(`${scope}.${childScope}`);
        }
    };
}

export function getLogLevel() {
    return getActiveLevel();
}

export function setLogLevel(level) {
    const normalized = normalizeLevel(level);

    if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, normalized);
    }

    return normalized;
}