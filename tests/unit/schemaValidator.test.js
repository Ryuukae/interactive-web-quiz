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
