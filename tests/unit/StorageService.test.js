import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import StorageService from "../../src/js/utils/StorageService.js";

describe("StorageService Utility Unit Tests", () => {
  beforeEach(() => {
    // Mock the global localStorage API
    const store = {};
    globalThis.localStorage = {
      getItem: vi.fn((key) => store[key] || null),
      setItem: vi.fn((key, value) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        for (let key in store) delete store[key];
      })
    };

    // Mock the logger to prevent console spam during tests
    vi.spyOn(StorageService.logger, "info").mockImplementation(() => {});
    vi.spyOn(StorageService.logger, "debug").mockImplementation(() => {});
    vi.spyOn(StorageService.logger, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("save", () => {
    it("should serialize data and write to localStorage", () => {
      const data = { test: 123 };
      StorageService.save("testKey", data);

      expect(globalThis.localStorage.setItem).toHaveBeenCalledWith(
        "testKey",
        JSON.stringify(data)
      );
    });

    it("should catch and log errors during serialization or writing", () => {
      // Force JSON.stringify to throw by creating a circular reference
      const circularData = {};
      circularData.self = circularData;

      StorageService.save("testKey", circularData);

      expect(StorageService.logger.error).toHaveBeenCalled();
      expect(globalThis.localStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe("load", () => {
    it("should parse and return data from localStorage if it exists", () => {
      const data = { test: 456 };
      globalThis.localStorage.setItem("testKey", JSON.stringify(data));

      const result = StorageService.load("testKey");
      expect(result).toEqual(data);
      expect(globalThis.localStorage.getItem).toHaveBeenCalledWith("testKey");
    });

    it("should return null if the item does not exist in localStorage", () => {
      const result = StorageService.load("missingKey");
      expect(result).toBeNull();
    });

    it("should catch errors and return null if parsing fails", () => {
      // Write invalid JSON directly to the mock store
      globalThis.localStorage.setItem("badKey", "{ invalid json ");

      const result = StorageService.load("badKey");

      expect(result).toBeNull();
      expect(StorageService.logger.error).toHaveBeenCalled();
    });
  });

  describe("clear", () => {
    it("should remove a specific item from localStorage", () => {
      StorageService.clear("testKey");
      expect(globalThis.localStorage.removeItem).toHaveBeenCalledWith(
        "testKey"
      );
    });

    it("should catch and log errors during clear", () => {
      globalThis.localStorage.removeItem.mockImplementationOnce(() => {
        throw new Error("Simulated localStorage error");
      });

      StorageService.clear("testKey");
      expect(StorageService.logger.error).toHaveBeenCalled();
    });
  });
});
