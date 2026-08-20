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
      disabled: false,
      questionData: [{}],
      resetQuiz: vi.fn(),
      getGradePercentage: vi.fn().mockReturnValue(100),
      getCurrentQuestion: vi
        .fn()
        .mockReturnValue({ question: "Q", answers: [] }),
      resetClickLock: vi.fn(),
      getProgressPercentage: vi.fn().mockReturnValue(0),
      evaluateAnswer: vi.fn()
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
            : id.includes("input")
              ? new globalThis.HTMLInputElement()
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
        el.click = vi.fn();
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

    expect(mockElements["return-start-btn"].style.display).toBe("inline-flex");
    expect(mockElements["return-builder-btn"].style.display).toBe("none");
  });

  it("should toggle visibility correctly in Builder mode", () => {
    const controller = new QuizUIController(
      mockQuizState,
      mockAppNavController
    );
    controller.isBuilderSource = true;
    controller.showResults();

    expect(mockElements["return-start-btn"].style.display).toBe("none");
    expect(mockElements["return-builder-btn"].style.display).toBe(
      "inline-flex"
    );
  });

  it("should bind event listeners without error and trigger callbacks", () => {
    const controller = new QuizUIController(
      mockQuizState,
      mockAppNavController
    );
    expect(mockElements["restart-btn"].addEventListener).toHaveBeenCalled();

    // Trigger restart-btn callback
    const restartCb = mockElements[
      "restart-btn"
    ].addEventListener.mock.calls.find((c) => c[0] === "click")[1];
    restartCb();
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

    // Test the click listener on the generated answer button
    const selectAnswerSpy = vi
      .spyOn(controller, "selectAnswer")
      .mockImplementation(() => {});
    const answerButton =
      mockElements["answers-container"].appendChild.mock.calls[0][0];
    const clickHandler = answerButton.addEventListener.mock.calls.find(
      (call) => call[0] === "click"
    )[1];
    clickHandler({ target: answerButton });
    expect(selectAnswerSpy).toHaveBeenCalled();
  });

  it("should abort showQuestion if no current question exists", () => {
    const controller = new QuizUIController(
      mockQuizState,
      mockAppNavController
    );
    mockQuizState.getCurrentQuestion = vi.fn().mockReturnValue(null);
    controller.showQuestion();
    expect(mockElements["question-text"].textContent).not.toBe("Q");
  });

  it("should throw an error in getEl if the element does not exist", () => {
    const originalGetElementById = globalThis.document.getElementById;
    globalThis.document.getElementById = vi.fn().mockReturnValue(null);
    expect(
      () => new QuizUIController(mockQuizState, mockAppNavController)
    ).toThrow();
    globalThis.document.getElementById = originalGetElementById;
  });

  it("should adjust question text font size dynamically", () => {
    const controller = new QuizUIController(
      mockQuizState,
      mockAppNavController
    );
    mockElements["question-text"].scrollHeight = 120;
    mockElements["question-text"].clientHeight = 300;
    expect(() => controller.adjustQuestionTextFontSize()).not.toThrow();
    expect(mockElements["question-text"].style.fontSize).toBeDefined();
  });

  it("should transition to showResults if the quiz is over after selecting an answer", () => {
    const controller = new QuizUIController(
      mockQuizState,
      mockAppNavController
    );
    mockQuizState.disabled = false;
    mockQuizState.isQuizOver = vi.fn().mockReturnValue(true);
    mockQuizState.advanceQuestion = vi.fn();
    mockQuizState.evaluateAnswer = vi.fn();

    const btn = new globalThis.HTMLElement();
    btn.dataset = { correct: "true" };

    mockElements["answers-container"].children = [];

    // Add an actual button and a text node (simulating a non-HTMLElement child)
    const validBtn = new globalThis.HTMLButtonElement();
    validBtn.dataset = { correct: "false" };
    validBtn.classList = { add: vi.fn() };

    const textNode = { nodeType: 3, textContent: "not an element" };

    mockElements["answers-container"].appendChild = vi.fn();
    mockElements["answers-container"].children = [validBtn, textNode];

    vi.useFakeTimers();
    const showResultsSpy = vi.spyOn(controller, "showResults");
    controller.selectAnswer({ target: btn });

    vi.runAllTimers();
    expect(showResultsSpy).toHaveBeenCalled();
    expect(validBtn.classList.add).toHaveBeenCalledWith("incorrect");
    vi.useRealTimers();
  });

  it("should handle restart button click", () => {
    const restartBtn = new globalThis.HTMLButtonElement();
    restartBtn.addEventListener = vi.fn((evt, cb) => {
      if (evt === "click") restartBtn.click = cb;
    });
    mockElements["restart-btn"] = restartBtn;

    const controller = new QuizUIController(
      mockQuizState,
      mockAppNavController
    );
    const startSpy = vi.spyOn(controller, "startQuiz");

    if (restartBtn.click) restartBtn.click();
    expect(startSpy).toHaveBeenCalled();
  });

  it("should recalculate font size on window resize when quiz is active", () => {
    let resizeCb;
    globalThis.window = {
      addEventListener: vi.fn((evt, cb) => {
        if (evt === "resize") resizeCb = cb;
      })
    };

    const quizScreen = new globalThis.HTMLElement();
    quizScreen.id = "quiz-screen";
    quizScreen.classList = {
      contains: vi.fn(() => true)
    };
    mockElements["quiz-screen"] = quizScreen;

    const controller = new QuizUIController(
      mockQuizState,
      mockAppNavController
    );
    const adjustSpy = vi.spyOn(controller, "adjustQuestionTextFontSize");

    if (resizeCb) resizeCb();
    expect(adjustSpy).toHaveBeenCalled();
  });

  it("should invoke requestAnimationFrame callback in showQuestion", () => {
    globalThis.requestAnimationFrame = vi.fn((cb) => cb());

    const controller = new QuizUIController(
      mockQuizState,
      mockAppNavController
    );
    const adjustSpy = vi.spyOn(controller, "adjustQuestionTextFontSize");
    controller.showQuestion();

    expect(adjustSpy).toHaveBeenCalled();
  });

  it("should ignore selectAnswer when quizState is disabled", () => {
    const controller = new QuizUIController(
      mockQuizState,
      mockAppNavController
    );
    mockQuizState.disabled = true;
    const evaluateSpy = vi.spyOn(mockQuizState, "evaluateAnswer");

    controller.selectAnswer({ target: new globalThis.HTMLElement() });
    expect(evaluateSpy).not.toHaveBeenCalled();
  });

  it("should transition to showQuestion if quiz is not over after answer selection", () => {
    const controller = new QuizUIController(
      mockQuizState,
      mockAppNavController
    );
    mockQuizState.disabled = false;
    mockQuizState.isQuizOver = vi.fn().mockReturnValue(false);
    mockQuizState.advanceQuestion = vi.fn();
    mockQuizState.evaluateAnswer = vi.fn();

    const btn = new globalThis.HTMLElement();
    btn.dataset = { correct: "false" };
    mockElements["answers-container"].children = [];

    vi.useFakeTimers();
    const showQuestionSpy = vi.spyOn(controller, "showQuestion");
    controller.selectAnswer({ target: btn });

    vi.runAllTimers();
    expect(showQuestionSpy).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("should toggle return buttons in showResults depending on isBuilderSource", () => {
    const returnStartBtn = new globalThis.HTMLElement();
    returnStartBtn.style = {};
    mockElements["return-start-btn"] = returnStartBtn;

    const returnBuilderBtn = new globalThis.HTMLElement();
    returnBuilderBtn.style = {};
    mockElements["return-builder-btn"] = returnBuilderBtn;

    const controller = new QuizUIController(
      mockQuizState,
      mockAppNavController
    );

    // When isBuilderSource is true
    controller.isBuilderSource = true;
    controller.showResults();
    expect(returnStartBtn.style.display).toBe("none");
    expect(returnBuilderBtn.style.display).toBe("inline-flex");

    // When isBuilderSource is false
    controller.isBuilderSource = false;
    controller.showResults();
    expect(returnStartBtn.style.display).toBe("inline-flex");
    expect(returnBuilderBtn.style.display).toBe("none");
  });
});
