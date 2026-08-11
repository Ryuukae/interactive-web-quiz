import { describe, it, expect } from 'vitest';
import QuizState from '../../src/js/models/QuizState.js';

describe('QuizState Model Unit Tests', () => {

    const sampleData = [
        { question: "Q1", answers: [{ text: "A1", correct: true }] },
        { question: "Q2", answers: [{ text: "A2", correct: true }] }
    ];

    it('should initialize score and index correctly', () => {
        const state = new QuizState(sampleData);
        expect(state.score).toBe(0);
        expect(state.index).toBe(0);
        expect(state.questionData).toHaveLength(2);
    });

    it('should calculate progress percentage accurately', () => {
        const state = new QuizState(sampleData);
        expect(state.getProgressPercentage()).toBe(50);
        state.advanceQuestion();
        expect(state.getProgressPercentage()).toBe(100);
    });

    it('should correctly evaluate quiz over state when advancing past last question', () => {
        const state = new QuizState(sampleData);
        expect(state.isQuizOver()).toBe(false);
        state.advanceQuestion();
        expect(state.isQuizOver()).toBe(false);
        state.advanceQuestion();
        expect(state.isQuizOver()).toBe(true);
    });
});
