import { describe, it, expect } from "vitest";
import {
    parseAndValidateRawText,
    validateQuizSchema
} from "../../src/js/utils/schemaValidator.js";

describe("schemaValidator Unit Tests", () => {
    it("should parse and validate a valid JSON array payload", () => {
        const jsonText = JSON.stringify([
            {
                question: "What is 5 + 5?",
                answers: [
                    { text: "10", correct: true },
                    { text: "12", correct: false }
                ]
            }
        ]);

        const result = parseAndValidateRawText(jsonText);
        expect(result).toHaveLength(1);
        expect(result[0].question).toBe("What is 5 + 5?");
        expect(result[0].answers).toHaveLength(2);
    });

    it("should reject whitespace-only JSON question prompts", () => {
        const invalidJson = JSON.stringify([
            {
                question: "   ",
                answers: [
                    { text: "10", correct: true },
                    { text: "12", correct: false }
                ]
            }
        ]);
        expect(() => parseAndValidateRawText(invalidJson)).toThrow(
            "prompt text cannot be empty or whitespace-only."
        );
    });

    it("should reject whitespace-only JSON answer option text", () => {
        const invalidJson = JSON.stringify([
            {
                question: "Valid Question?",
                answers: [
                    { text: "   ", correct: true },
                    { text: "12", correct: false }
                ]
            }
        ]);
        expect(() => parseAndValidateRawText(invalidJson)).toThrow(
            "text cannot be empty or whitespace-only"
        );
    });

    it("should reject JSON questions missing correct: false distractor answer options", () => {
        const invalidJson = JSON.stringify([
            {
                question: "Valid Question?",
                answers: [{ text: "10", correct: true }]
            }
        ]);
        expect(() => parseAndValidateRawText(invalidJson)).toThrow(
            "Must contain between 2 and 7 items"
        );
    });

    it("should fall back to QAD parsing if text is not JSON", () => {
        const qadText = "Q=What is 2+2?\nA=4\nD=5";
        const result = parseAndValidateRawText(qadText);
        expect(result).toHaveLength(1);
        expect(result[0].question).toBe("What is 2+2?");
    });

    it("should throw an error if payload is structurally invalid", () => {
        const invalidJson = JSON.stringify({ question: "Not an array" });
        expect(() => parseAndValidateRawText(invalidJson)).toThrow();
    });

    it("should throw an error for missing required schema fields", () => {
        const badData = [{ answers: [{ text: "Yes", correct: true }] }]; // Missing "question"
        expect(() => validateQuizSchema(badData)).toThrow();
    });

    it("should throw an error if no answers are marked correct", () => {
        const badData = [
            { question: "Q1", answers: [{ text: "Yes", correct: false }] }
        ];
        expect(() => validateQuizSchema(badData)).toThrow();
    });

    it("should throw an error for invalid JSON that fails QAD fallback", () => {
        const gibberish = "NOT JSON \n AND NOT QAD";
        expect(() => parseAndValidateRawText(gibberish)).toThrow();
    });

    it("should throw an error if the JSON root is an object instead of an array", () => {
        const badData = { question: "Not an array", answers: [] };
        expect(() => validateQuizSchema(badData)).toThrow();
    });

    it("should throw an error if the answers property is not an array", () => {
        const badData = [
            { question: "Q1", answers: "String instead of array" }
        ];
        expect(() => validateQuizSchema(badData)).toThrow();
    });

    it("should throw an error if an answer is missing the text property", () => {
        const badData = [{ question: "Q1", answers: [{ correct: true }] }]; // Missing "text"
        expect(() => validateQuizSchema(badData)).toThrow();
    });

    it("should throw an error if the correct property is a string instead of a strict boolean", () => {
        const badData = [
            { question: "Q1", answers: [{ text: "Yes", correct: "true" }] }
        ];
        expect(() => validateQuizSchema(badData)).toThrow();
    });

    it("should reject empty payloads", () => {
        expect(() => parseAndValidateRawText("")).toThrow("No valid question blocks detected.");
        expect(() => parseAndValidateRawText("   ")).toThrow("No valid question blocks detected.");
    });

    it("should reject empty JSON arrays", () => {
        expect(() => parseAndValidateRawText("[]")).toThrow("No valid QAD or JSON questions detected.");
    });
});
