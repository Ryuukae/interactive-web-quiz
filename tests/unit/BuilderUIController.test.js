// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import BuilderUIController from "../../src/js/controllers/BuilderUIController.js";
import * as prompts from "../../src/js/utils/prompts.js";
import * as fileIO from "../../src/js/utils/fileIO.js";
import StorageService from "../../src/js/utils/StorageService.js";

vi.mock("../../src/js/utils/prompts.js", () => ({
  confirmAction: vi.fn(),
  alertAction: vi.fn()
}));

vi.mock("../../src/js/utils/fileIO.js", () => ({
  exportQAD: vi.fn()
}));

vi.mock("../../src/js/utils/StorageService.js", () => ({
  default: {
    save: vi.fn(),
    load: vi.fn(),
    clear: vi.fn()
  }
}));

describe("BuilderUIController Unit Tests", () => {
  let mockBuilderState;
  let mockQuizUIController;
  let mockAppNavController;
  let controller;

  beforeEach(() => {
    vi.clearAllMocks();

    Element.prototype.scrollTo = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();

    document.body.innerHTML = `
      <div id="builder-questions-container"></div>
      <button id="btn-add-question"></button>
      <button id="btn-run-builder-quiz"></button>
      <button id="btn-export-quiz"></button>
      <button id="btn-clear-builder"></button>
      <div id="modal-focus-edit">
        <div class="focus-modal-title"></div>
        <div class="focus-badge"></div>
        <textarea id="focus-modal-q-input"></textarea>
        <textarea id="focus-modal-a-input"></textarea>
        <div id="focus-modal-distractors-container"></div>
        <button id="btn-focus-modal-add-distractor"></button>
        <button id="btn-focus-modal-remove-distractor"></button>
        <button id="btn-focus-modal-done"></button>
        <button id="btn-focus-modal-cancel"></button>
        <button id="close-focus-edit-btn"></button>
      </div>
    `;

    mockBuilderState = {
      cards: [],
      addCard: vi.fn((card) => mockBuilderState.cards.push(card)),
      removeCard: vi.fn((card) => {
        mockBuilderState.cards = mockBuilderState.cards.filter(
          (c) => c !== card
        );
      }),
      clearAll: vi.fn(() => {
        mockBuilderState.cards = [];
      }),
      collapseAllCards: vi.fn(),
      validateAllCards: vi.fn(() => true),
      getSerializedPayload: vi.fn(() => [{ question: "Test Q", answers: [] }])
    };

    mockQuizUIController = {
      loadCustomQuiz: vi.fn()
    };

    mockAppNavController = {
      navigateTo: vi.fn(),
      openModalById: vi.fn(),
      closeModalById: vi.fn()
    };

    controller = new BuilderUIController(
      mockBuilderState,
      mockQuizUIController,
      mockAppNavController
    );
    mockBuilderState.addCard.mockClear();
    mockBuilderState.clearAll.mockClear();
    vi.mocked(StorageService.save).mockClear();
  });

  it("should initialize DOM bindings and event listeners", () => {
    expect(controller.builderContainer).toBeDefined();
    expect(controller.focusModal).toBeDefined();
  });

  it("should handle initializeBuilder with cached data", () => {
    vi.mocked(StorageService.load).mockReturnValueOnce([
      {
        question: "Q1",
        answers: [
          { text: "A1", correct: true },
          { text: "D1", correct: false }
        ]
      }
    ]);

    controller.initializeBuilder();
    expect(mockBuilderState.addCard).toHaveBeenCalled();
  });

  it("should handle initializeBuilder without cache by creating single blank card", () => {
    vi.mocked(StorageService.load).mockReturnValueOnce(null);

    controller.initializeBuilder();
    expect(mockBuilderState.addCard).toHaveBeenCalled();
  });

  it("should correctly evaluate hasExistingData", () => {
    expect(controller.hasExistingData()).toBe(false);

    mockBuilderState.cards = [{}, {}];
    expect(controller.hasExistingData()).toBe(true);

    mockBuilderState.cards = [
      {
        qInput: { value: "Some text" },
        aInput: { value: "" },
        dContainer: null
      }
    ];
    expect(controller.hasExistingData()).toBe(true);
  });

  it("should populate cards from data array", () => {
    const dataset = [
      { question: "External Q1", answers: [] },
      { question: "External Q2", answers: [] }
    ];

    controller.populateCardsFromData(dataset);
    expect(mockBuilderState.clearAll).toHaveBeenCalled();
    expect(mockBuilderState.addCard).toHaveBeenCalledTimes(2);
    expect(StorageService.save).toHaveBeenCalled();

    const createdCard = mockBuilderState.addCard.mock.calls[0][0];
    createdCard.onDeleteCallback(createdCard);
    expect(mockBuilderState.removeCard).toHaveBeenCalled();

    const focusSpy = vi.spyOn(controller.focusModal, "open");
    createdCard.onFocusCallback(createdCard);
    expect(focusSpy).toHaveBeenCalled();
  });

  it("should trigger callbacks on cards created by initializeBuilder", () => {
    controller.initializeBuilder();
    const createdCard = mockBuilderState.addCard.mock.calls[0][0];

    const focusSpy = vi.spyOn(controller.focusModal, "open");
    createdCard.onFocusCallback(createdCard);
    expect(focusSpy).toHaveBeenCalled();

    createdCard.onDeleteCallback(createdCard);
    expect(mockBuilderState.removeCard).toHaveBeenCalled();
  });

  it("should ignore populateCardsFromData if given empty data", () => {
    mockBuilderState.addCard.mockClear();
    controller.populateCardsFromData([]);
    expect(mockBuilderState.addCard).not.toHaveBeenCalled();
  });

  it("should handle handleAddQuestion when limit is reached", () => {
    mockBuilderState.cards = new Array(50).fill({});
    controller.handleAddQuestion();
    expect(prompts.alertAction).toHaveBeenCalledWith(
      "Maximum question limit reached (50)."
    );
  });

  it("should handle handleAddQuestion when validation fails", () => {
    mockBuilderState.cards = [{}];
    mockBuilderState.validateAllCards.mockReturnValueOnce(false);
    const scrollSpy = vi.spyOn(controller, "scrollToFirstError");

    controller.handleAddQuestion();
    expect(scrollSpy).toHaveBeenCalled();
  });

  it("should handle handleAddQuestion successfully opening focus modal", () => {
    mockBuilderState.cards = [{}];
    mockBuilderState.validateAllCards.mockReturnValueOnce(true);
    const openSpy = vi.spyOn(controller.focusModal, "open");

    controller.handleAddQuestion();
    expect(openSpy).toHaveBeenCalled();
  });

  it("should start builder quiz if cards are valid", () => {
    mockBuilderState.cards = [{}];
    mockBuilderState.validateAllCards.mockReturnValueOnce(true);
    mockBuilderState.getSerializedPayload.mockReturnValueOnce([
      { question: "Valid Q", answers: [] }
    ]);

    controller.startBuilderQuiz();
    expect(mockQuizUIController.loadCustomQuiz).toHaveBeenCalled();
  });

  it("should block startBuilderQuiz if no cards exist or payload empty", () => {
    mockBuilderState.cards = [];
    controller.startBuilderQuiz();
    expect(prompts.alertAction).toHaveBeenCalled();

    mockBuilderState.cards = [{}];
    mockBuilderState.validateAllCards.mockReturnValueOnce(true);
    mockBuilderState.getSerializedPayload.mockReturnValueOnce([]);
    controller.startBuilderQuiz();
    expect(prompts.alertAction).toHaveBeenCalled();
  });

  it("should export builder quiz if valid", () => {
    mockBuilderState.cards = [{}];
    mockBuilderState.validateAllCards.mockReturnValueOnce(true);
    mockBuilderState.getSerializedPayload.mockReturnValueOnce([
      { question: "Export Q", answers: [] }
    ]);

    controller.exportBuilderQuiz();
    expect(fileIO.exportQAD).toHaveBeenCalled();
    expect(StorageService.clear).toHaveBeenCalledWith("quiz-builder-cache");
  });

  it("should block exportBuilderQuiz if cards are empty", () => {
    mockBuilderState.cards = [];
    controller.exportBuilderQuiz();
    expect(prompts.alertAction).toHaveBeenCalled();
  });

  it("should handle handleModalSave in new card mode", () => {
    const qData = {
      question: "Brand new question",
      correct_answer: "Ans",
      distractors: ["Dist 1"]
    };

    controller.handleModalSave(qData, null);
    expect(mockBuilderState.addCard).toHaveBeenCalled();
  });

  it("should handle handleModalSave in edit mode", () => {
    const fakeCard = {
      qInput: document.createElement("textarea"),
      aInput: document.createElement("textarea"),
      dContainer: document.createElement("div"),
      node: document.createElement("div"),
      autoExpand: vi.fn(),
      updateDistractorButtonStates: vi.fn()
    };

    const qData = {
      question: "Edited prompt",
      correct_answer: "Edited ans",
      distractors: ["D1", "D2"]
    };

    controller.handleModalSave(qData, fakeCard);
    expect(fakeCard.qInput.value).toBe("Edited prompt");
    expect(fakeCard.aInput.value).toBe("Edited ans");
  });

  it("should trigger button click listeners correctly", () => {
    Element.prototype.scrollTo = vi.fn();
    Element.prototype.scrollIntoView = vi.fn();

    const addSpy = vi.spyOn(controller, "handleAddQuestion");
    document.getElementById("btn-add-question").click();
    expect(addSpy).toHaveBeenCalled();

    const runSpy = vi.spyOn(controller, "startBuilderQuiz");
    document.getElementById("btn-run-builder-quiz").click();
    expect(runSpy).toHaveBeenCalled();

    const exportSpy = vi.spyOn(controller, "exportBuilderQuiz");
    document.getElementById("btn-export-quiz").click();
    expect(exportSpy).toHaveBeenCalled();

    // Clear confirmed
    mockBuilderState.cards = [{}];
    vi.mocked(prompts.confirmAction).mockReturnValueOnce(true);
    document.getElementById("btn-clear-builder").click();
    expect(mockBuilderState.clearAll).toHaveBeenCalled();

    // Clear cancelled
    mockBuilderState.cards = [{}];
    vi.mocked(prompts.confirmAction).mockReturnValueOnce(false);
    document.getElementById("btn-clear-builder").click();
  });

  it("should auto-save builder state after debounce on input", () => {
    vi.useFakeTimers();
    controller.builderContainer.dispatchEvent(new Event("input"));
    vi.advanceTimersByTime(10000);
    expect(StorageService.save).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("should scroll to error when startBuilderQuiz or exportBuilderQuiz fails card validation", () => {
    mockBuilderState.cards = [{}];
    mockBuilderState.validateAllCards.mockReturnValue(false);
    const scrollSpy = vi.spyOn(controller, "scrollToFirstError");

    controller.startBuilderQuiz();
    expect(scrollSpy).toHaveBeenCalledTimes(1);

    controller.exportBuilderQuiz();
    expect(scrollSpy).toHaveBeenCalledTimes(2);
  });

  it("should locate and scroll to first error element in scrollToFirstError", () => {
    vi.useFakeTimers();
    const errorInput = document.createElement("textarea");
    errorInput.className = "glass-input q-input input-error";
    controller.builderContainer.appendChild(errorInput);

    controller.scrollToFirstError();
    vi.advanceTimersByTime(100);

    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("should trigger callbacks for cards hydrated from cache", () => {
    vi.mocked(StorageService.load).mockReturnValueOnce([
      {
        question: "Cached Q",
        answers: [
          { text: "A", correct: true },
          { text: "D", correct: false }
        ]
      }
    ]);

    controller.initializeBuilder();
    const cachedCard = mockBuilderState.addCard.mock.calls[0][0];

    const focusSpy = vi.spyOn(controller.focusModal, "open");
    cachedCard.onFocusCallback(cachedCard);
    expect(focusSpy).toHaveBeenCalled();

    cachedCard.onDeleteCallback(cachedCard);
    expect(mockBuilderState.removeCard).toHaveBeenCalled();
  });

  it("should throw error if builder-questions-container is missing on constructor", () => {
    document.getElementById("builder-questions-container").remove();
    expect(
      () =>
        new BuilderUIController(
          mockBuilderState,
          mockQuizUIController,
          mockAppNavController
        )
    ).toThrow("Missing DOM node: builder-questions-container");
  });

  it("should reset saveTimeout if input event triggers repeatedly within 10s", () => {
    vi.useFakeTimers();
    controller.builderContainer.dispatchEvent(new Event("input"));
    vi.advanceTimersByTime(5000);
    // Trigger second input
    controller.builderContainer.dispatchEvent(new Event("input"));
    vi.advanceTimersByTime(5000);
    // At total 10s from first input, should not have fired yet because timeout was reset
    expect(StorageService.save).not.toHaveBeenCalled();
    vi.advanceTimersByTime(5000);
    expect(StorageService.save).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("should trigger callbacks on cards created via handleModalSave new card mode", () => {
    controller.handleModalSave(
      { question: "New Q", correct_answer: "A", distractors: ["D1"] },
      null
    );
    const newCard = mockBuilderState.addCard.mock.calls[0][0];

    const focusSpy = vi.spyOn(controller.focusModal, "open");
    newCard.onFocusCallback(newCard);
    expect(focusSpy).toHaveBeenCalled();

    newCard.onDeleteCallback(newCard);
    expect(mockBuilderState.removeCard).toHaveBeenCalled();
  });

  it("should handleModalSave for an existing card and simulate input", () => {
    const card = {
      qInput: document.createElement("textarea"),
      aInput: document.createElement("textarea"),
      dContainer: document.createElement("div"),
      node: document.createElement("div"),
      autoExpand: vi.fn(),
      updateDistractorButtonStates: null,
      addBtn: document.createElement("button")
    };
    const titleNode = document.createElement("div");
    titleNode.className = "card-title";
    card.node.appendChild(titleNode);

    controller.handleModalSave(
      {
        question: "Edit Q",
        correct_answer: "A2",
        distractors: [{ text: "D2" }, "D3"]
      },
      card
    );

    expect(card.qInput.value).toBe("Edit Q");
    expect(card.aInput.value).toBe("A2");
    expect(card.dContainer.children.length).toBe(2);

    // Simulate input on newly created distractor textarea
    card.dContainer.children[0].dispatchEvent(new Event("input"));
    expect(card.autoExpand).toHaveBeenCalled();

    // With 2 distractors, addBtn should be visible
    expect(card.addBtn.style.display).toBe("inline-flex");
  });

  it("should evaluate hasExistingData correctly", () => {
    // Zero cards
    mockBuilderState.cards = [];
    expect(controller.hasExistingData()).toBe(false);

    // Two cards
    mockBuilderState.cards = [{}, {}];
    expect(controller.hasExistingData()).toBe(true);

    // One empty card
    const dContainer = document.createElement("div");
    const dInput = document.createElement("textarea");
    dInput.className = "d-input";
    dInput.value = "";
    dContainer.appendChild(dInput);

    const card = {
      qInput: { value: "" },
      aInput: { value: "" },
      dContainer: dContainer
    };
    mockBuilderState.cards = [card];
    expect(controller.hasExistingData()).toBe(false);

    // One card with qInput data
    card.qInput.value = "Has data";
    expect(controller.hasExistingData()).toBe(true);
    card.qInput.value = "";

    // One card with distractor data
    dInput.value = "Distractor text";
    expect(controller.hasExistingData()).toBe(true);
  });
});
