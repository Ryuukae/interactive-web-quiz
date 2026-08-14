import { describe, it, expect, beforeEach, vi } from "vitest";
import QuizUIController from "../../src/js/controllers/QuizUIController.js";

describe("QuizUIController Unit Tests", () => {
    let mockQuizState;
    let mockAppNavController;
    let mockElements;

    beforeEach(() => {
        mockQuizState = {
            score: 0,
            index: 0,
            questionData: [{}],
            resetQuiz: vi.fn(),
            getGradePercentage: vi.fn().mockReturnValue(100),
            getCurrentQuestion: vi
                .fn()
                .mockReturnValue({ question: "Q", answers: [] }),
            resetClickLock: vi.fn(),
            getProgressPercentage: vi.fn().mockReturnValue(0)
        };

        mockAppNavController = {
            navigateTo: vi.fn()
        };

        globalThis.HTMLElement = class HTMLElement {};
        globalThis.HTMLButtonElement = class HTMLButtonElement extends (
            globalThis.HTMLElement
        ) {};
        globalThis.HTMLInputElement = class HTMLInputElement extends (
            globalThis.HTMLElement
        ) {};

        mockElements = {};

        globalThis.document = {
            getElementById: (id) => {
                if (!mockElements[id]) {
                    const el = id.includes("btn")
                        ? new globalThis.HTMLButtonElement()
                        : new globalThis.HTMLElement();
                    el.id = id;
                    el.addEventListener = vi.fn();
                    el.classList = {
                        add: vi.fn(),
                        remove: vi.fn()
                    };
                    el.style = {};
                    el.nextElementSibling = new globalThis.HTMLElement();
                    el.nextElementSibling.style = {};
                    mockElements[id] = el;
                }
                return mockElements[id];
            },
            createElement: (tag) => {
                const el = new globalThis.HTMLElement();
                el.classList = { add: vi.fn() };
                el.dataset = {};
                el.addEventListener = vi.fn();
                return el;
            }
        };
    });

    it("should set isBuilderSource cleanly when invoked from Builder", () => {
        const controller = new QuizUIController(
            mockQuizState,
            mockAppNavController
        );
        expect(controller.isBuilderSource).toBe(false);

        controller.loadCustomQuiz([{ question: "test", answers: [] }], true);
        expect(controller.isBuilderSource).toBe(true);
    });

    it("should toggle visibility correctly in Default mode", () => {
        const controller = new QuizUIController(
            mockQuizState,
            mockAppNavController
        );
        controller.isBuilderSource = false;
        controller.showResults();

        expect(
            mockElements["result-file-input"].nextElementSibling.style.display
        ).toBe("inline-flex");
        expect(mockElements["return-start-btn"].style.display).toBe(
            "inline-flex"
        );
        expect(mockElements["return-builder-btn"].style.display).toBe("none");
        expect(mockElements["btn-export-results"].style.display).toBe("none");
    });

    it("should toggle visibility correctly in Builder mode", () => {
        const controller = new QuizUIController(
            mockQuizState,
            mockAppNavController
        );
        controller.isBuilderSource = true;
        controller.showResults();

        expect(
            mockElements["result-file-input"].nextElementSibling.style.display
        ).toBe("none");
        expect(mockElements["return-start-btn"].style.display).toBe("none");
        expect(mockElements["return-builder-btn"].style.display).toBe(
            "inline-flex"
        );
        expect(mockElements["btn-export-results"].style.display).toBe(
            "inline-flex"
        );
    });

    it("should bind event listeners without error", () => {
        const controller = new QuizUIController(
            mockQuizState,
            mockAppNavController
        );
        expect(mockElements["start-btn"].addEventListener).toHaveBeenCalled();
        expect(mockElements["restart-btn"].addEventListener).toHaveBeenCalled();
        expect(
            mockElements["custom-file-input"].addEventListener
        ).toHaveBeenCalled();
    });

    it("should start the quiz correctly", () => {
        const controller = new QuizUIController(
            mockQuizState,
            mockAppNavController
        );
        controller.startQuiz();
        expect(mockQuizState.resetQuiz).toHaveBeenCalled();
        expect(mockAppNavController.navigateTo).toHaveBeenCalledWith("quiz");
    });

    it("should handle handleFileUpload with no files gracefully", async () => {
        const controller = new QuizUIController(mockQuizState, mockAppNavController);
        const event = { target: new globalThis.HTMLInputElement() };
        await controller.handleFileUpload(event, "file-name-display");
        expect(controller.customPayload).toBe(null);
    });

    it("should parse and load custom quiz correctly on valid file upload", async () => {
        const controller = new QuizUIController(mockQuizState, mockAppNavController);
        
        // Create mock File and FileReader for environment if needed
        const validJson = '[{"question":"Q1","answers":[{"text":"A1","correct":true},{"text":"A2","correct":false}]}]';
        const file = new Blob([validJson], {type: 'application/json'});
        file.name = "test.json";
        const target = new globalThis.HTMLInputElement();
        target.files = [file];
        const event = { target: target };
        
        globalThis.FileReader = class {
            readAsText() {
                this.result = validJson;
                if (this.onload) this.onload({ target: this });
            }
        };

        await controller.handleFileUpload(event, "file-name-display");
        
        expect(controller.customPayload).toBeTruthy();
        expect(controller.isBuilderSource).toBe(false);
    });
    it("should handle selectAnswer when correct", () => {
        const controller = new QuizUIController(
            mockQuizState,
            mockAppNavController
        );
        mockQuizState.disabled = false;
        mockQuizState.isQuizOver = vi.fn().mockReturnValue(false);
        mockQuizState.advanceQuestion = vi.fn();
        mockQuizState.evaluateAnswer = vi.fn();

        const btn = new globalThis.HTMLElement();
        btn.dataset = { correct: "true" };

        const child1 = new globalThis.HTMLElement();
        child1.dataset = { correct: "true" };
        child1.classList = { add: vi.fn() };
        const child2 = new globalThis.HTMLElement();
        child2.dataset = { correct: "false" };
        child2.classList = { add: vi.fn() };

        mockElements["answers-container"].children = [child1, child2];
        mockElements["answers-container"].innerHTML = "";
        mockElements["answers-container"].appendChild = vi.fn();

        const event = { target: btn };
        vi.useFakeTimers();
        controller.selectAnswer(event);
        expect(child1.classList.add).toHaveBeenCalledWith("correct");
        expect(child2.classList.add).toHaveBeenCalledWith("incorrect");

        vi.runAllTimers();
        expect(mockQuizState.advanceQuestion).toHaveBeenCalled();
        vi.useRealTimers();
    });

    it("should abort selectAnswer if state disabled or not element", () => {
        const controller = new QuizUIController(
            mockQuizState,
            mockAppNavController
        );
        mockQuizState.disabled = true;
        controller.selectAnswer({ target: new globalThis.HTMLElement() });
        mockQuizState.disabled = false;
        controller.selectAnswer({ target: null });
    });

    it("should showQuestion properly", () => {
        const controller = new QuizUIController(
            mockQuizState,
            mockAppNavController
        );
        mockQuizState.getCurrentQuestion = vi.fn().mockReturnValue({
            question: "Q",
            answers: [
                { text: "A1", correct: true },
                { text: "A2", correct: false }
            ]
        });
        mockElements["answers-container"].innerHTML = "";
        mockElements["answers-container"].appendChild = vi.fn();
        controller.showQuestion();
        expect(mockElements["question-text"].textContent).toBe("Q");
    });
});
