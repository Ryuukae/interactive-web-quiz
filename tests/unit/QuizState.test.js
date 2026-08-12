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

    it('should retrieve the current question data accurately', () => {
        const state = new QuizState(sampleData);
        const current = state.getCurrentQuestion();
        expect(current).toEqual(sampleData[0]);
    });

    it('should properly increment the score for a correct answer', () => {
        const state = new QuizState(sampleData);
        state.evaluateAnswer(true);
        expect(state.score).toBe(1);
    });

    it('should not increment the score for an incorrect answer', () => {
        const state = new QuizState(sampleData);
        state.evaluateAnswer(false);
        expect(state.score).toBe(0);
    });

    it('should reset the quiz state cleanly', () => {
        const state = new QuizState(sampleData);
        state.advanceQuestion();
        state.score = 1;

        state.resetQuiz();
        expect(state.index).toBe(0);
        expect(state.score).toBe(0);
    });

    it('should block answer evaluation if the click lock is active', () => {
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
});
