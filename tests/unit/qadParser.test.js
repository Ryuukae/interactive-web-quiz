import { describe, it, expect } from "vitest";
import { parseQADFormat } from "../../src/js/utils/qadParser.js";

describe("qadParser Unit Tests", () => {
  it("should parse valid quote-wrapped QAD text into structured question objects", () => {
    const rawText =
      'Q="What is the capital of France?"\nA="Paris"\nD="London"\nD="Berlin"';
    const result = parseQADFormat(rawText);

    expect(result).toHaveLength(1);
    expect(result[0].question).toBe("What is the capital of France?");
    expect(result[0].answers).toHaveLength(3);

    const correctAnswer = result[0].answers.find((a) => a.correct);
    expect(correctAnswer.text).toBe("Paris");
  });

  it("should parse multiple QAD questions cleanly with separating blank lines", () => {
    const rawText = `
Q="Question 1?"
A="Ans 1"
D="Dist 1"

Q="Question 2?"
A="Ans 2"
D="Dist 2"
        `.trim();

    const result = parseQADFormat(rawText);
    expect(result).toHaveLength(2);
    expect(result[0].question).toBe("Question 1?");
    expect(result[1].question).toBe("Question 2?");
  });

  it("should parse multi-line values and preserve internal line breaks and empty lines", () => {
    const rawText = `
Q="Line 1 of question

Line 3 of question"
A="Correct
multi-line"
D="Distractor"
    `.trim();

    const result = parseQADFormat(rawText);
    expect(result).toHaveLength(1);
    expect(result[0].question).toBe("Line 1 of question\n\nLine 3 of question");
    expect(result[0].answers[0].text).toBe("Correct\nmulti-line");
  });

  it("should allow indentation before prefix tags", () => {
    const rawText = `
  Q="Indented Question?"
    A="Indented Answer"
      D="Indented Distractor"
    `.trim();

    const result = parseQADFormat(rawText);
    expect(result).toHaveLength(1);
    expect(result[0].question).toBe("Indented Question?");
    expect(result[0].answers[0].text).toBe("Indented Answer");
    expect(result[0].answers[1].text).toBe("Indented Distractor");
  });

  it("should support escaped quotes inside quoted values", () => {
    const rawText =
      'Q="What does \\"MVC\\" stand for?"\nA="Model View Controller"\nD="None"';
    const result = parseQADFormat(rawText);
    expect(result).toHaveLength(1);
    expect(result[0].question).toBe('What does "MVC" stand for?');
  });

  it("should automatically trim leading and trailing whitespace from quoted values", () => {
    const rawText =
      'Q="  Padded Question?  "\nA="  Padded Answer  "\nD="  Padded Distractor  "';
    const result = parseQADFormat(rawText);
    expect(result[0].question).toBe("Padded Question?");
    expect(result[0].answers[0].text).toBe("Padded Answer");
    expect(result[0].answers[1].text).toBe("Padded Distractor");
  });

  it("should throw an error if values are not enclosed in quotes", () => {
    const unquotedText = "Q=Unquoted Question\nA=Unquoted Answer\nD=Distractor";
    expect(() => parseQADFormat(unquotedText)).toThrow(
      "QAD format requires values to be enclosed in quotes"
    );
  });

  it("should reject whitespace-only QAD answer lines", () => {
    const invalidText = 'Q="Valid Question?"\nA="   "\nD="Distractor"';
    expect(() => parseQADFormat(invalidText)).toThrow(
      "cannot be empty inside quotes."
    );
  });

  it("should reject whitespace-only QAD distractor lines", () => {
    const invalidText = 'Q="Valid Question?"\nA="Correct Answer"\nD="   "';
    expect(() => parseQADFormat(invalidText)).toThrow(
      "cannot be empty inside quotes."
    );
  });

  it("should reject blank lines between entries within the same question group", () => {
    const invalidText = `
Q="Valid Question?"

A="Correct Answer"
D="Distractor"
    `.trim();
    expect(() => parseQADFormat(invalidText)).toThrow(
      "No empty lines or trailing spaces permitted between Q, A, and D lines"
    );
  });

  it("should throw an error on unclosed quotes", () => {
    const invalidText = 'Q="Unclosed Question without closing quote';
    expect(() => parseQADFormat(invalidText)).toThrow("Unclosed quote");
  });

  it("should throw an error if a question is missing correct answer or distractors", () => {
    const invalidText = 'Q="Incomplete Question?"\nA="Only Answer"';
    expect(() => parseQADFormat(invalidText)).toThrow();
  });

  it("should throw an error if a distractor block appears before a question", () => {
    const invalidText = 'D="Distractor"\nQ="Question?"\nA="Answer"';
    expect(() => parseQADFormat(invalidText)).toThrow();
  });

  it("should throw an error if a block is missing the Question (Q=) line", () => {
    const invalidText = 'A="Only Answer"\nD="Distractor"';
    expect(() => parseQADFormat(invalidText)).toThrow();
  });

  it("should throw an error if a block is missing the Answer (A=) line", () => {
    const invalidText = 'Q="Only Question?"\nD="Distractor"';
    expect(() => parseQADFormat(invalidText)).toThrow();
  });

  it("should throw error for empty or whitespace-only raw text", () => {
    expect(() => parseQADFormat("")).toThrow(
      "No valid question blocks detected."
    );
    expect(() => parseQADFormat("   \n\n   ")).toThrow(
      "No valid question blocks detected."
    );
    expect(() => parseQADFormat("invalid line")).toThrow("Malformed QAD line");
    expect(() => parseQADFormat(null)).toThrow();
  });

  it("should throw error if no valid question blocks are found", () => {
    // Empty text
    expect(() => parseQADFormat("")).toThrow(
      "No valid question blocks detected"
    );
  });

  it("should throw error if block is missing question text", () => {
    // A block with an empty question prompt
    const text = `
Q=""
A="Correct"
D="Distractor"
    `;
    expect(() => parseQADFormat(text)).toThrow(
      "Question block is missing prompt text"
    );
  });
});
