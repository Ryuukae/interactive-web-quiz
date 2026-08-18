import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Integration CSS Selector Audit Tests", () => {
  const cssDir = path.resolve(process.cwd(), "src/css");
  const cssFiles = [
    "base.css",
    "builder.css",
    "components.css",
    "responsive.css",
    "screens.css",
    "style.css"
  ];

  cssFiles.forEach((file) => {
    it(`src/css/${file} should exist, be non-empty, and have balanced brackets`, () => {
      const filePath = path.join(cssDir, file);
      const content = fs.readFileSync(filePath, "utf8");

      expect(content.trim().length).toBeGreaterThan(0);

      // Count opening and closing curly brackets to verify syntax structure
      const openBrackets = (content.match(/\{/g) || []).length;
      const closeBrackets = (content.match(/\}/g) || []).length;
      expect(openBrackets).toBe(closeBrackets);
    });
  });
});
