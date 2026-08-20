import { describe, it, expect } from "vitest";
import QuizState from "../../src/js/models/QuizState.js";

describe("QuizState Model Unit Tests", () => {
  const sampleData = [
    { question: "Q1", answers: [{ text: "A1", correct: true }] },
    { question: "Q2", answers: [{ text: "A2", correct: true }] }
  ];

  it("should initialize score and index correctly", () => {
    const state = new QuizState(sampleData);
    expect(state.score).toBe(0);
    expect(state.index).toBe(0);
    expect(state.questionData).toHaveLength(2);
  });

  it("should calculate progress percentage accurately", () => {
    const state = new QuizState(sampleData);
    expect(state.getProgressPercentage()).toBe(50);
    state.advanceQuestion();
    expect(state.getProgressPercentage()).toBe(100);
  });

  it("should correctly evaluate quiz over state when advancing past last question", () => {
    const state = new QuizState(sampleData);
    expect(state.isQuizOver()).toBe(false);
    state.advanceQuestion();
    expect(state.isQuizOver()).toBe(false);
    state.advanceQuestion();
    expect(state.isQuizOver()).toBe(true);
  });

  it("should retrieve the current question data accurately", () => {
    const state = new QuizState(sampleData);
    const current = state.getCurrentQuestion();
    expect(current).toEqual(sampleData[0]);
  });

  it("should properly increment the score for a correct answer", () => {
    const state = new QuizState(sampleData);
    state.evaluateAnswer(true);
    expect(state.score).toBe(1);
  });

  it("should not increment the score for an incorrect answer", () => {
    const state = new QuizState(sampleData);
    state.evaluateAnswer(false);
    expect(state.score).toBe(0);
  });

  it("should reset the quiz state cleanly", () => {
    const state = new QuizState(sampleData);
    state.advanceQuestion();
    state.score = 1;

    state.resetQuiz();
    expect(state.index).toBe(0);
    expect(state.score).toBe(0);
  });

  it("should block answer evaluation if the click lock is active", () => {
    const state = new QuizState(sampleData);

    // First answer locks the state
    state.evaluateAnswer(true);
    const scoreAfterFirst = state.score;

    // Second answer should be ignored due to the branch: if (this.disabled) return;
    state.evaluateAnswer(true);
    expect(state.score).toBe(scoreAfterFirst);

    // Unlocking the state should allow evaluation again
    state.resetClickLock();
    state.evaluateAnswer(true);
    expect(state.score).toBe(scoreAfterFirst + 1);
  });

  it("should calculate grade percentage accurately", () => {
    const state = new QuizState(sampleData);
    state.score = 1;
    expect(state.getGradePercentage()).toBe(50);
  });

  it("should shuffle quiz data appropriately", () => {
    const state = new QuizState(sampleData);
    const data = [
      { q: 1, answers: [{ a: 1 }] },
      { q: 2, answers: [{ a: 1 }] },
      { q: 3, answers: [{ a: 1 }] }
    ];
    const result = state.shuffleQuizData([...data]);
    expect(result.length).toBe(3);
    // It shuffles answers too
    expect(result[0].answers.length).toBe(1);
  });

  it("should hit fallback in shuffleQuizData if given a non-array", () => {
    const state = new QuizState(sampleData);
    expect(() => state.shuffleQuizData(null)).toThrow();
  });

  it("should throw an error if instantiated with non-array data", () => {
    expect(() => new QuizState("not an array")).toThrow(
      "QuizState requires an array of question objects."
    );
    expect(() => new QuizState(null)).toThrow(
      "QuizState requires an array of question objects."
    );
  });

  it("should throw an error if randomizeDeck is called with non-array", () => {
    const qs = new QuizState(sampleData);
    expect(() => qs.randomizeDeck(null)).toThrow();
  });
});
