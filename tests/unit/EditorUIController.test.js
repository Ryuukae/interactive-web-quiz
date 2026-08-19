import { describe, it, expect, vi, beforeEach } from "vitest";
import EditorUIController from "../../src/js/controllers/EditorUIController.js";
import {
  getTxtTemplate,
  getJsonTemplate
} from "../../src/js/utils/templates.js";
import * as prompts from "../../src/js/utils/prompts.js";
import * as schemaValidator from "../../src/js/utils/schemaValidator.js";
import * as fileIO from "../../src/js/utils/fileIO.js";

// Mocking dependencies natively
vi.mock("../../src/js/utils/templates.js", () => ({
  getTxtTemplate: vi.fn(() => "TXT_TEMPLATE_DATA"),
  getJsonTemplate: vi.fn(() => "JSON_TEMPLATE_DATA")
}));

vi.mock("../../src/js/utils/prompts.js", () => ({
  confirmAction: vi.fn(),
  alertAction: vi.fn()
}));

vi.mock("../../src/js/utils/schemaValidator.js", () => ({
  parseAndValidateRawText: vi.fn()
}));

vi.mock("../../src/js/utils/fileIO.js", () => ({
  exportQAD: vi.fn()
}));

describe("EditorUIController Unit Tests", () => {
  let mockQuizUIController;
  let mockAppNavController;
  let controller;
  let mockElements;

  beforeEach(() => {
    vi.clearAllMocks();

    globalThis.HTMLElement = class HTMLElement {};
    globalThis.HTMLTextAreaElement = class HTMLTextAreaElement extends (
      globalThis.HTMLElement
    ) {};
    globalThis.HTMLButtonElement = class HTMLButtonElement extends (
      globalThis.HTMLElement
    ) {};

    mockElements = {};

    globalThis.document = {
      getElementById: (id) => {
        if (!mockElements[id]) {
          let el;
          if (id === "editor-textarea")
            el = new globalThis.HTMLTextAreaElement();
          else if (id.startsWith("btn"))
            el = new globalThis.HTMLButtonElement();
          else el = new globalThis.HTMLElement();

          el.id = id;
          el.value = "";
          el.textContent = "";
          el.className = "";
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

    mockQuizUIController = {
      loadCustomQuiz: vi.fn()
    };

    mockAppNavController = {
      navigateTo: vi.fn()
    };

    controller = new EditorUIController(
      mockQuizUIController,
      mockAppNavController
    );
  });

  it("should initialize DOM references correctly", () => {
    expect(controller.editorTextarea).toBeInstanceOf(HTMLTextAreaElement);
    expect(controller.editorStatus).toBeInstanceOf(HTMLElement);
  });

  it("should insert TXT template if editor is empty", () => {
    const btn = document.getElementById("btn-editor-template-txt");
    controller.editorTextarea.value = "";
    btn.click();
    expect(controller.editorTextarea.value).toBe("TXT_TEMPLATE_DATA");
  });

  it("should prompt before inserting TXT template if editor has content", () => {
    const btn = document.getElementById("btn-editor-template-txt");
    controller.editorTextarea.value = "Some text";
    prompts.confirmAction.mockReturnValueOnce(true);
    btn.click();
    expect(prompts.confirmAction).toHaveBeenCalled();
    expect(controller.editorTextarea.value).toBe("TXT_TEMPLATE_DATA");
  });

  it("should parse payload successfully and route to quiz screen", () => {
    const btn = document.getElementById("btn-editor-parse");
    controller.editorTextarea.value = "Valid QAD Data";

    schemaValidator.parseAndValidateRawText.mockReturnValueOnce([
      { question: "Q1" }
    ]);

    btn.click();

    expect(schemaValidator.parseAndValidateRawText).toHaveBeenCalledWith(
      "Valid QAD Data"
    );
    expect(mockQuizUIController.loadCustomQuiz).toHaveBeenCalledWith(
      [{ question: "Q1" }],
      true
    );
  });

  it("should display error if parsing fails", () => {
    const btn = document.getElementById("btn-editor-parse");
    controller.editorTextarea.value = "Invalid Data";

    schemaValidator.parseAndValidateRawText.mockImplementationOnce(() => {
      throw new Error("Invalid Format");
    });

    btn.click();

    expect(schemaValidator.parseAndValidateRawText).toHaveBeenCalledWith(
      "Invalid Data"
    );
    expect(mockQuizUIController.loadCustomQuiz).not.toHaveBeenCalled();
    expect(controller.editorStatus.textContent).toContain("Invalid Format");
  });

  it("should export payload successfully", () => {
    const btn = document.getElementById("btn-editor-export");
    controller.editorTextarea.value = "Export Data";

    schemaValidator.parseAndValidateRawText.mockReturnValueOnce([
      { question: "Q1" }
    ]);

    btn.click();

    expect(schemaValidator.parseAndValidateRawText).toHaveBeenCalledWith(
      "Export Data"
    );
    expect(fileIO.exportQAD).toHaveBeenCalledWith([{ question: "Q1" }]);
  });
});
