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

    // Spy on console to prevent spam and verify error handling
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "debug").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
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

      expect(() => {
        StorageService.save("testKey", circularData);
      }).not.toThrow();

      expect(console.error).toHaveBeenCalled();
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
      expect(console.error).toHaveBeenCalled();
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

      expect(() => {
        StorageService.clear("testKey");
      }).not.toThrow();
      expect(console.error).toHaveBeenCalled();
    });
  });
});
