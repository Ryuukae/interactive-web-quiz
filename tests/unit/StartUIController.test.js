import { describe, it, expect, vi, beforeEach } from "vitest";
import StartUIController from "../../src/js/controllers/StartUIController.js";
import * as fileIO from "../../src/js/utils/fileIO.js";
import * as schemaValidator from "../../src/js/utils/schemaValidator.js";
import * as prompts from "../../src/js/utils/prompts.js";

vi.mock("../../src/js/utils/fileIO.js", () => ({
  readFile: vi.fn()
}));

vi.mock("../../src/js/utils/schemaValidator.js", () => ({
  parseAndValidateRawText: vi.fn()
}));

vi.mock("../../src/js/utils/prompts.js", () => ({
  confirmAction: vi.fn()
}));

describe("StartUIController Unit Tests", () => {
  let mockAppNavController;
  let mockQuizUIController;
  let mockBuilderUIController;
  let mockEditorUIController;
  let mockElements;

  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.HTMLElement = class HTMLElement {};
    globalThis.HTMLInputElement = class HTMLInputElement extends (
      globalThis.HTMLElement
    ) {
      constructor() {
        super();
        this.value = "";
        this.files = [];
      }
    };
    globalThis.HTMLButtonElement = class HTMLButtonElement extends (
      globalThis.HTMLElement
    ) {};

    mockElements = {};

    globalThis.document = {
      getElementById: (id) => {
        if (!mockElements[id]) {
          let el;
          if (id.includes("input")) {
            el = new globalThis.HTMLInputElement();
          } else if (id.startsWith("btn") || id.startsWith("create-")) {
            el = new globalThis.HTMLButtonElement();
          } else {
            el = new globalThis.HTMLElement();
          }
          el.id = id;
          el.className = "";
          el.textContent = "";
          el.listeners = {};
          el.addEventListener = (evt, cb) => {
            el.listeners[evt] = cb;
          };
          el.click = function () {
            if (this.listeners["click"]) this.listeners["click"]();
          };
          mockElements[id] = el;
        }
        return mockElements[id];
      }
    };

    mockAppNavController = {
      openModalById: vi.fn(),
      closeAllModals: vi.fn(),
      navigateTo: vi.fn()
    };

    mockQuizUIController = {
      loadCustomQuiz: vi.fn()
    };

    mockBuilderUIController = {
      hasExistingData: vi.fn(() => false),
      populateCardsFromData: vi.fn()
    };

    mockEditorUIController = {
      hasExistingData: vi.fn(() => false),
      editorTextarea: { value: "" }
    };
  });

  it("should initialize cleanly and bind event listeners", () => {
    const controller = new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );
    expect(controller).toBeDefined();
    expect(controller.pendingModifyData).toBe(null);
  });

  it("should ignore missing DOM elements gracefully during initialization", () => {
    const originalGetElementById = globalThis.document.getElementById;
    globalThis.document.getElementById = () => null;

    const controller = new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    expect(controller).toBeDefined();
    globalThis.document.getElementById = originalGetElementById;
  });

  it("should open creation mode modal when create quizset button is clicked", () => {
    new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    mockElements["create-quizset-btn"].click();
    expect(mockAppNavController.openModalById).toHaveBeenCalledWith(
      "creation-mode-modal"
    );
  });

  it("should route to creator on btn-use-builder click without pending modify payload", () => {
    new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    mockElements["btn-use-builder"].click();
    expect(mockAppNavController.closeAllModals).toHaveBeenCalled();
    expect(mockAppNavController.navigateTo).toHaveBeenCalledWith("creator");
  });

  it("should route to creator and populate builder when pending modify data is present", () => {
    const controller = new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    controller.pendingModifyData = {
      parsedQuestions: [{ question: "Q1", answers: [] }],
      rawText: 'Q="Q1"',
      fileName: "quiz.txt"
    };

    mockElements["btn-use-builder"].click();
    expect(mockBuilderUIController.populateCardsFromData).toHaveBeenCalledWith([
      { question: "Q1", answers: [] }
    ]);
    expect(controller.pendingModifyData).toBe(null);
    expect(mockAppNavController.navigateTo).toHaveBeenCalledWith("creator");
  });

  it("should prompt overwrite if builder has existing data when importing modify payload", () => {
    mockBuilderUIController.hasExistingData.mockReturnValue(true);
    prompts.confirmAction.mockReturnValue(false);

    const controller = new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    controller.pendingModifyData = {
      parsedQuestions: [{ question: "Q1", answers: [] }],
      rawText: 'Q="Q1"',
      fileName: "quiz.txt"
    };

    mockElements["btn-use-builder"].click();
    expect(prompts.confirmAction).toHaveBeenCalled();
    expect(
      mockBuilderUIController.populateCardsFromData
    ).not.toHaveBeenCalled();

    // Now confirmed
    prompts.confirmAction.mockReturnValue(true);
    mockElements["btn-use-builder"].click();
    expect(mockBuilderUIController.populateCardsFromData).toHaveBeenCalled();
  });

  it("should route to editor and populate text when pending modify data is present", () => {
    const controller = new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    controller.pendingModifyData = {
      parsedQuestions: [{ question: "Q1", answers: [] }],
      rawText: 'Q="Q1"',
      fileName: "quiz.txt"
    };

    mockElements["btn-use-editor"].click();
    expect(mockEditorUIController.editorTextarea.value).toBe('Q="Q1"');
    expect(controller.pendingModifyData).toBe(null);
    expect(mockAppNavController.navigateTo).toHaveBeenCalledWith("editor");
  });

  it("should prompt overwrite if editor has existing data when importing modify payload", () => {
    mockEditorUIController.hasExistingData.mockReturnValue(true);
    prompts.confirmAction.mockReturnValue(false);

    const controller = new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    controller.pendingModifyData = {
      parsedQuestions: [{ question: "Q1", answers: [] }],
      rawText: 'Q="Q1"',
      fileName: "quiz.txt"
    };

    mockElements["btn-use-editor"].click();
    expect(prompts.confirmAction).toHaveBeenCalled();
    expect(controller.pendingModifyData).not.toBeNull();

    // Now confirmed
    prompts.confirmAction.mockReturnValue(true);
    mockElements["btn-use-editor"].click();
    expect(controller.pendingModifyData).toBeNull();
  });

  it("should handle btn-use-builder routing with no modify payload or missing controllers", () => {
    const controller = new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      null, // missing builderUIController
      null // missing editorUIController
    );
    controller.pendingModifyData = {
      parsedQuestions: [{ question: "Q1", answers: [] }],
      rawText: 'Q="Q1"',
      fileName: "quiz.txt"
    };

    // Using builder with missing controller should skip populateCardsFromData
    mockElements["btn-use-builder"].click();
    expect(mockAppNavController.navigateTo).toHaveBeenCalledWith("creator");

    controller.pendingModifyData = {
      parsedQuestions: [{ question: "Q1", answers: [] }],
      rawText: 'Q="Q1"',
      fileName: "quiz.txt"
    };

    // Using editor with missing controller should skip setting editorTextarea
    mockElements["btn-use-editor"].click();
    expect(mockAppNavController.navigateTo).toHaveBeenCalledWith("editor");

    // With no payload
    controller.pendingModifyData = null;
    mockElements["btn-use-builder"].click();
    expect(mockAppNavController.navigateTo).toHaveBeenCalledWith("creator");
  });

  it("should prompt overwrite if builder has existing data when importing modify payload", () => {
    mockBuilderUIController.hasExistingData.mockReturnValue(true);
    prompts.confirmAction.mockReturnValue(false);

    const controller = new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    controller.pendingModifyData = {
      parsedQuestions: [{ question: "Q1", answers: [] }],
      rawText: 'Q="Q1"',
      fileName: "quiz.txt"
    };

    mockElements["btn-use-builder"].click();
    expect(prompts.confirmAction).toHaveBeenCalled();
    expect(controller.pendingModifyData).not.toBeNull();

    // Now confirmed
    prompts.confirmAction.mockReturnValue(true);
    mockElements["btn-use-builder"].click();
    expect(mockBuilderUIController.populateCardsFromData).toHaveBeenCalled();
    expect(controller.pendingModifyData).toBeNull();
  });

  it("should route to editor cleanly when btn-use-editor is clicked without pending modify data", () => {
    new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    mockElements["btn-use-editor"].click();
    expect(mockAppNavController.closeAllModals).toHaveBeenCalled();
    expect(mockAppNavController.navigateTo).toHaveBeenCalledWith("editor");
  });

  it("should process take-quiz-file-input change correctly on valid file", async () => {
    new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    fileIO.readFile.mockResolvedValue('Q="Q1"');
    schemaValidator.parseAndValidateRawText.mockReturnValue([
      { question: "Q1", answers: [] }
    ]);

    const file = { name: "quiz.txt" };
    const input = mockElements["take-quiz-file-input"];
    input.files = [file];

    const changeCb = input.listeners["change"];
    await changeCb({ target: input });

    expect(mockQuizUIController.loadCustomQuiz).toHaveBeenCalledWith(
      [{ question: "Q1", answers: [] }],
      false
    );
  });

  it("should process modify-quiz-file-input change correctly and open modal", async () => {
    const controller = new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    fileIO.readFile.mockResolvedValue('Q="Q1"');
    schemaValidator.parseAndValidateRawText.mockReturnValue([
      { question: "Q1", answers: [] }
    ]);

    const file = { name: "quiz.txt" };
    const input = mockElements["modify-quiz-file-input"];
    input.files = [file];

    const changeCb = input.listeners["change"];
    await changeCb({ target: input });

    expect(controller.pendingModifyData).toEqual({
      parsedQuestions: [{ question: "Q1", answers: [] }],
      rawText: 'Q="Q1"',
      fileName: "quiz.txt"
    });
    expect(mockAppNavController.openModalById).toHaveBeenCalledWith(
      "creation-mode-modal"
    );
  });

  it("should handle take-quiz-file-input error gracefully", async () => {
    new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    fileIO.readFile.mockRejectedValue(new Error("File Read Error"));

    const file = { name: "quiz.txt" };
    const input = mockElements["take-quiz-file-input"];
    input.files = [file];

    const changeCb = input.listeners["change"];
    await changeCb({ target: input });

    expect(prompts.confirmAction).not.toHaveBeenCalled();
  });

  it("should handle modify-quiz-file-input parse error gracefully", async () => {
    new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    fileIO.readFile.mockResolvedValue("Invalid");
    schemaValidator.parseAndValidateRawText.mockImplementation(() => {
      throw new Error("Parse Fail");
    });

    const file = { name: "quiz.txt" };
    const input = mockElements["modify-quiz-file-input"];
    input.files = [file];

    const changeCb = input.listeners["change"];
    await changeCb({ target: input });

    expect(mockAppNavController.openModalById).not.toHaveBeenCalled();
  });

  it("should return early when file input changes with no files selected", async () => {
    new StartUIController(
      mockAppNavController,
      mockQuizUIController,
      mockBuilderUIController,
      mockEditorUIController
    );

    const input = mockElements["take-quiz-file-input"];
    input.files = [];
    const changeCb = input.listeners["change"];
    await changeCb({ target: input });

    expect(fileIO.readFile).not.toHaveBeenCalled();

    const modifyInput = mockElements["modify-quiz-file-input"];
    modifyInput.files = [];
    const modifyChangeCb = modifyInput.listeners["change"];
    await modifyChangeCb({ target: modifyInput });

    expect(fileIO.readFile).not.toHaveBeenCalled();
  });
});
