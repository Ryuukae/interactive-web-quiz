import { describe, it, expect, beforeEach } from 'vitest';
import AppNavigationController from '../../src/js/controllers/AppNavigationController.js';

describe('AppNavigationController Unit Tests', () => {

    beforeEach(() => {
        globalThis.document = {
            getElementById: (id) => ({
                id,
                classList: {
                    add: () => {},
                    remove: () => {}
                },
                addEventListener: () => {}
            })
        };
    });

    it('should initialize screen navigation nodes cleanly', () => {
        const nav = new AppNavigationController();
        expect(Object.keys(nav.screens)).toHaveLength(4);
    });

    it('should update active screen when navigateTo is called', () => {
        let activeScreenId = 'start';
        globalThis.document = {
            getElementById: (id) => ({
                id,
                classList: {
                    add: () => { activeScreenId = id; },
                    remove: () => {}
                },
                addEventListener: () => {}
            })
        };

        const nav = new AppNavigationController();

        nav.navigateTo('quiz');
        expect(activeScreenId).toBe('quiz-screen');

        nav.navigateTo('creator');
        expect(activeScreenId).toBe('creator-screen');
    });

    it('should warn and ignore invalid screen names cleanly', () => {
        const nav = new AppNavigationController();
        expect(() => nav.navigateTo('invalid-screen')).not.toThrow();
    });
});
