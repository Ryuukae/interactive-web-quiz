import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
    exportJSON,
    exportQAD,
    downloadQuizTxt,
    readFile
} from "../../src/js/utils/fileIO.js";

let capturedBlobContent = null;
let capturedBlobType = null;

describe("fileIO Utility Unit Tests", () => {
    beforeEach(() => {
        capturedBlobContent = null;
        capturedBlobType = null;
        globalThis.document = {
            createElement: () => ({
                href: "",
                download: "",
                click: () => {}
            }),
            body: {
                appendChild: () => {},
                removeChild: () => {}
            }
        };
        globalThis.URL = {
            createObjectURL: () => "blob:mock-url",
            revokeObjectURL: () => {}
        };
        globalThis.Blob = class MockBlob {
            constructor(content, options) {
                this.content = content;
                this.options = options;
                capturedBlobContent = content[0];
                capturedBlobType = options?.type;
            }
        };
    });

    it("should correctly export QAD data and generate a text/plain Blob", () => {
        const mockData = [
            {
                question: "Test QAD?",
                answers: [
                    { text: "Correct", correct: true },
                    { text: "Wrong", correct: false }
                ]
            }
        ];
        
        expect(() => exportQAD(mockData, "test.txt")).not.toThrow();
        expect(capturedBlobType).toBe("text/plain");
        expect(capturedBlobContent).toContain("Q=Test QAD?");
        expect(capturedBlobContent).toContain("A=Correct");
        expect(capturedBlobContent).toContain("D=Wrong");
    });

    it("should abort QAD export if payload is empty", () => {
        expect(() => exportQAD([], "test.txt")).not.toThrow();
        expect(capturedBlobContent).toBeNull();
    });

    it("should export JSON data without crashing", () => {
        const mockData = [
            { question: "Test?", answers: [{ text: "Yes", correct: true }] }
        ];
        expect(() => exportJSON(mockData, "test-quiz.json")).not.toThrow();
    });

    it("should abort JSON export if payload is empty", () => {
        expect(() => exportJSON([], "test-quiz.json")).not.toThrow();
    });

    it("should read file content asynchronously using FileReader", async () => {
        class MockFileReader {
            readAsText(file) {
                setTimeout(() => {
                    if (this.onload) {
                        this.result = "Q=Test?\nA=Ans\nD=Dist";
                        this.onload({ target: this, loaded: 20 });
                    }
                }, 10);
            }
        }
        globalThis.FileReader = MockFileReader;

        const mockFile = { name: "test.txt", size: 20 };
        const content = await readFile(mockFile);
        expect(content).toBe("Q=Test?\nA=Ans\nD=Dist");
    });

    it("should gracefully handle and reject FileReader errors", async () => {
        class MockErrorFileReader {
            readAsText() {
                setTimeout(() => {
                    if (this.onerror)
                        this.onerror(new Error("Simulated read error"));
                }, 10);
            }
        }
        globalThis.FileReader = MockErrorFileReader;

        const mockFile = { name: "error.txt", size: 20 };
        await expect(readFile(mockFile)).rejects.toThrow(
            "Failed to read the provided file."
        );
    });

    it("should return an empty string if the FileReader event target is invalid", async () => {
        class MockInvalidFileReader {
            readAsText() {
                setTimeout(() => {
                    // Passes a plain object instead of a FileReader instance to trigger the fallback branch
                    if (this.onload)
                        this.onload({ target: { result: "Corrupted Data" } });
                }, 10);
            }
        }
        const originalReader = globalThis.FileReader;
        globalThis.FileReader = MockInvalidFileReader;

        const mockFile = { name: "invalid.txt", size: 20 };
        const content = await readFile(mockFile);

        // The fallback branch should catch the bad target and return an empty string
        expect(content).toBe("");

        // Cleanup
        globalThis.FileReader = originalReader;
    });

    it("should handle null file gracefully in initial logger trace and reject", async () => {
        await expect(readFile(null)).rejects.toThrow();
    });

    it("should abort JSON export if payload is null instead of an array", () => {
        expect(() => exportJSON(null, "test.json")).not.toThrow();
    });

    it("should export JSON data if payload is a single object instead of an array", () => {
        const mockData = {
            question: "Single Object",
            answers: [{ text: "Yes", correct: true }]
        };
        expect(() => exportJSON(mockData, "test.json")).not.toThrow();
    });

    it("should handle malformed QAD payload arrays safely during export", () => {
        const mockData = [
            null, // Covers: if (!qObj)
            { question: null }, // Covers: if (!qObj.question)
            { question: "Q1", answers: null }, // Covers: if (Array.isArray(answers))
            { question: "Q2", answers: [
                null, // Covers: if (aObj)
                { text: "Wrong" } // Hits the fallback distractor logic without a "correct" flag
            ]}
        ];
        
        expect(() => exportQAD(mockData, "test.txt")).not.toThrow();
        expect(capturedBlobContent).toContain("Q=Q2");
        expect(capturedBlobContent).toContain("D=Wrong");
    });
});
