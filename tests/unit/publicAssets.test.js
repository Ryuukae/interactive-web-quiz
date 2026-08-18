import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { parseAndValidateRawText } from "../../src/js/utils/schemaValidator.js";

describe("Public Asset Sample Integrity Tests", () => {
  it("public/questions.json should exist and pass schema validation cleanly", () => {
    const filePath = path.resolve(process.cwd(), "public/questions.json");
    const rawContent = fs.readFileSync(filePath, "utf8");
    expect(rawContent.trim().length).toBeGreaterThan(0);

    const parsed = parseAndValidateRawText(rawContent);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it("public/template.json should exist and pass schema validation cleanly", () => {
    const filePath = path.resolve(process.cwd(), "public/template.json");
    const rawContent = fs.readFileSync(filePath, "utf8");
    expect(rawContent.trim().length).toBeGreaterThan(0);

    const parsed = parseAndValidateRawText(rawContent);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it("public/template.txt should exist and pass QAD parsing cleanly", () => {
    const filePath = path.resolve(process.cwd(), "public/template.txt");
    const rawContent = fs.readFileSync(filePath, "utf8");
    expect(rawContent.trim().length).toBeGreaterThan(0);

    const parsed = parseAndValidateRawText(rawContent);
    expect(parsed.length).toBeGreaterThan(0);
  });
});
