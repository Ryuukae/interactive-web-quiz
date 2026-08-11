import { describe, it, expect } from 'vitest';
import AppNavigationController from '../../src/js/controllers/AppNavigationController.js';

describe('AppNavigationController Unit Tests', () => {

    it('should initialize with default active screen track', () => {
        const nav = new AppNavigationController();
        expect(nav.activeScreen).toBe('start');
    });

    it('should update active screen when switchScreen is called', () => {
        const mockScreenNodes = {
            start: { classList: { add: () => {}, remove: () => {} } },
            quiz: { classList: { add: () => {}, remove: () => {} } },
            creator: { classList: { add: () => {}, remove: () => {} } },
            result: { classList: { add: () => {}, remove: () => {} } }
        };

        const nav = new AppNavigationController();
        nav.screens = mockScreenNodes;

        nav.switchScreen('quiz');
        expect(nav.activeScreen).toBe('quiz');

        nav.switchScreen('creator');
        expect(nav.activeScreen).toBe('creator');
    });

    it('should ignore invalid screen names cleanly', () => {
        const nav = new AppNavigationController();
        nav.switchScreen('invalid-screen');
        expect(nav.activeScreen).toBe('start');
    });
});
