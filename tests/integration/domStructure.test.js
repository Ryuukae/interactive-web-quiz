import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";

describe("Integration DOM Structure Verification", () => {
    const htmlPath = path.resolve(process.cwd(), "index.html");
    const htmlContent = fs.readFileSync(htmlPath, "utf8");

    const requiredElementIds = [
        "start-screen",
        "quiz-screen",
        "creator-screen",
        "result-screen",
        "create-quizset-btn",
        "builder-questions-container",
        "bulk-import-panel",
        "bulk-import-header",
        "bulk-import-text",
        "bulk-import-status",
        "btn-parse-bulk",
        "btn-template-txt",
        "btn-template-json",
        "btn-add-question",
        "btn-run-builder-quiz",
        "btn-export-quiz",
        "btn-clear-builder"
    ];

    requiredElementIds.forEach((id) => {
        it(`index.html should contain required element ID: #${id}`, () => {
            const hasId =
                htmlContent.includes(`id="${id}"`) ||
                htmlContent.includes(`id='${id}'`);
            expect(hasId).toBe(true);
        });
    });
});
