import { describe, it, expect } from 'vitest';
import { parseQADFormat } from '../../src/js/utils/qadParser.js';

describe('qadParser Unit Tests', () => {

    it('should parse valid QAD text into structured question objects', () => {
        const rawText = "Q=What is the capital of France?\nA=Paris\nD=London\nD=Berlin";
        const result = parseQADFormat(rawText);
        
        expect(result).toHaveLength(1);
        expect(result[0].question).toBe('What is the capital of France?');
        expect(result[0].answers).toHaveLength(3);
        
        const correctAnswer = result[0].answers.find(a => a.correct);
        expect(correctAnswer.text).toBe('Paris');
    });

    it('should parse multiple QAD questions cleanly', () => {
        const rawText = `
Q=Question 1?
A=Ans 1
D=Dist 1

Q=Question 2?
A=Ans 2
D=Dist 2
        `.trim();

        const result = parseQADFormat(rawText);
        expect(result).toHaveLength(2);
        expect(result[0].question).toBe('Question 1?');
        expect(result[1].question).toBe('Question 2?');
    });

    it('should reject whitespace-only QAD answer lines', () => {
        const invalidText = "Q=Valid Question?\nA=   \nD=Distractor";
        expect(() => parseQADFormat(invalidText)).toThrow("cannot be empty or whitespace-only.");
    });

    it('should reject whitespace-only QAD distractor lines', () => {
        const invalidText = "Q=Valid Question?\nA=Correct Answer\nD=   ";
        expect(() => parseQADFormat(invalidText)).toThrow("cannot be empty or whitespace-only.");
    });

    it('should throw an error if a question is missing correct answer or distractors', () => {
        const invalidText = "Q=Incomplete Question?\nA=Only Answer";
        expect(() => parseQADFormat(invalidText)).toThrow();
    });
});
