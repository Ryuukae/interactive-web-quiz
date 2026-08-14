import { describe, it, expect } from "vitest";
import {
    getTxtTemplate,
    getJsonTemplate
} from "../../src/js/utils/templates.js";

describe("templates Utility Unit Tests", () => {
    it("should return a valid non-empty TXT template string containing QAD tags", () => {
        const txt = getTxtTemplate();
        expect(typeof txt).toBe("string");
        expect(txt.trim().length).toBeGreaterThan(0);
        expect(txt.toLowerCase()).toContain("q=");
        expect(txt.toLowerCase()).toContain("a=");
        expect(txt.toLowerCase()).toContain("d=");
    });

    it("should return a valid non-empty JSON template string containing question structure", () => {
        const json = getJsonTemplate();
        expect(typeof json).toBe("string");
        expect(json.trim().length).toBeGreaterThan(0);
        expect(json).toContain('"question"');
        expect(json).toContain('"answers"');
        expect(json).toContain('"correct"');
    });
});
