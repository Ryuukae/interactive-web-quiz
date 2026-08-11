import { describe, it, expect } from 'vitest';
import { parseAndValidateRawText } from '../../src/js/utils/schemaValidator.js';

describe('schemaValidator Unit Tests', () => {

    it('should parse and validate a valid JSON array payload', () => {
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

    it('should reject whitespace-only JSON question prompts', () => {
        const invalidJson = JSON.stringify([
            {
                question: "   ",
                answers: [
                    { text: "10", correct: true },
                    { text: "12", correct: false }
                ]
            }
        ]);
        expect(() => parseAndValidateRawText(invalidJson)).toThrow("prompt text cannot be empty or whitespace-only.");
    });

    it('should reject whitespace-only JSON answer option text', () => {
        const invalidJson = JSON.stringify([
            {
                question: "Valid Question?",
                answers: [
                    { text: "   ", correct: true },
                    { text: "12", correct: false }
                ]
            }
        ]);
        expect(() => parseAndValidateRawText(invalidJson)).toThrow("text cannot be empty or whitespace-only");
    });

    it('should reject JSON questions missing correct: false distractor answer options', () => {
        const invalidJson = JSON.stringify([
            {
                question: "Valid Question?",
                answers: [
                    { text: "10", correct: true }
                ]
            }
        ]);
        expect(() => parseAndValidateRawText(invalidJson)).toThrow("Must contain between 2 and 7 items");
    });

    it('should fall back to QAD parsing if text is not JSON', () => {
        const qadText = "Q=What is 2+2?\nA=4\nD=5";
        const result = parseAndValidateRawText(qadText);
        expect(result).toHaveLength(1);
        expect(result[0].question).toBe("What is 2+2?");
    });

    it('should throw an error if payload is structurally invalid', () => {
        const invalidJson = JSON.stringify({ question: "Not an array" });
        expect(() => parseAndValidateRawText(invalidJson)).toThrow();
    });
});
