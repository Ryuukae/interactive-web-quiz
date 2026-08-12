import { describe, it, expect, beforeEach } from 'vitest';
import AppNavigationController from '../../src/js/controllers/AppNavigationController.js';

describe('AppNavigationController Unit Tests', () => {

    beforeEach(() => {
        globalThis.HTMLElement = class HTMLElement {};
        globalThis.HTMLButtonElement = class HTMLButtonElement extends globalThis.HTMLElement {};
        
        globalThis.document = {
            getElementById: (id) => {
                const isBtn = id.includes('btn');
                const el = isBtn ? new globalThis.HTMLButtonElement() : new globalThis.HTMLElement();
                el.id = id;
                el.classList = {
                    add: () => {},
                    remove: () => {}
                };
                el.addEventListener = () => {};
                return el;
            }
        };
    });

    it('should initialize screen navigation nodes cleanly', () => {
        const nav = new AppNavigationController();
        expect(Object.keys(nav.screens)).toHaveLength(4);
    });

    it('should update active screen when navigateTo is called', () => {
        let activeScreenId = 'start';
        globalThis.document = {
            getElementById: (id) => {
                const isBtn = id.includes('btn');
                const el = isBtn ? new globalThis.HTMLButtonElement() : new globalThis.HTMLElement();
                el.id = id;
                el.classList = {
                    add: () => { activeScreenId = id; },
                    remove: () => {}
                };
                el.addEventListener = () => {};
                return el;
            }
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

    it('should return early if navigating to the currently active screen', () => {
        const nav = new AppNavigationController();
        
        // First navigation sets the active state
        nav.navigateTo('quiz');
        
        // Second navigation to the same screen should trigger the early-return branch
        expect(() => nav.navigateTo('quiz')).not.toThrow();
    });
});
