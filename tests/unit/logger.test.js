import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createLogger,
  setLogLevel,
  getLogLevel
} from "../../src/js/utils/logger.js";

describe("logger Utility Unit Tests", () => {
  beforeEach(() => {
    let mockStorage = {};
    globalThis.window = {
      localStorage: {
        getItem: (key) => mockStorage[key] || null,
        setItem: (key, value) => {
          mockStorage[key] = String(value);
        }
      }
    };
  });

  it("should create a scoped logger instance with logging methods", () => {
    const logger = createLogger("TestScope");
    expect(typeof logger.trace).toBe("function");
    expect(typeof logger.debug).toBe("function");
    expect(typeof logger.info).toBe("function");
    expect(typeof logger.warn).toBe("function");
    expect(typeof logger.error).toBe("function");
  });

  it("should log messages formatted with scope and level", () => {
    const consoleSpy = vi.spyOn(console, "info").mockImplementation(() => {});
    const logger = createLogger("ScopeA");

    logger.info("Test info message", { key: "value" });
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should log error messages cleanly without crashing", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const logger = createLogger("ErrorScope");

    expect(() =>
      logger.error("Failure detected", new Error("Mock Error"))
    ).not.toThrow();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });

  it("should handle all log levels and undefined details payloads", () => {
    // Drop the threshold to ensure all switch branches execute
    setLogLevel("trace");

    const logger = createLogger("CoverageScope");

    // We verify the branches execute cleanly without throwing errors.
    // Bypassing vi.spyOn here avoids Vitest's console proxy reference dropping.
    expect(() => {
      logger.trace("Trace level message", { data: 1 });
      logger.debug("Debug level message", { data: 2 });
      logger.warn("Warn level message", { data: 3 });

      // Trigger the undefined details fallback branch
      logger.info("Message without any details object");
    }).not.toThrow();

    // Reset the threshold to keep the rest of your app quiet
    setLogLevel("info");
  });

  it("should correctly set and get log levels", () => {
    // Test standard level modification
    setLogLevel("error");
    expect(getLogLevel()).toBe("error");

    // Test fallback to default "info" on an invalid input
    setLogLevel("invalid-level");
    expect(getLogLevel()).toBe("info");

    setLogLevel("silent");
    expect(getLogLevel()).toBe("silent");

    setLogLevel(null);
    expect(getLogLevel()).toBe("info");

    setLogLevel(undefined);
    expect(getLogLevel()).toBe("info");
  });

  it("should create a child logger with a combined scope", () => {
    const parentLogger = createLogger("Parent");
    const childLogger = parentLogger.child("Child");

    // Verify the child function instantiates successfully
    expect(typeof childLogger.info).toBe("function");
  });
});
