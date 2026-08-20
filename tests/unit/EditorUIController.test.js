// @vitest-environment jsdom
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
  exportQAD: vi.fn(),
  readFile: vi.fn()
}));

describe("EditorUIController Unit Tests", () => {
  let mockQuizUIController;
  let mockAppNavController;
  let controller;

  beforeEach(() => {
    vi.clearAllMocks();

    document.body.innerHTML = `
      <textarea id="editor-textarea"></textarea>
      <div id="editor-status"></div>
      <button id="btn-editor-template-txt"></button>
      <button id="btn-editor-template-json"></button>
      <input type="file" id="input-editor-import-file" />
      <button id="btn-editor-clear"></button>
      <button id="btn-editor-cancel"></button>
      <button id="btn-editor-parse"></button>
      <button id="btn-editor-export"></button>
      <button id="btn-focus-editor-expand"></button>
      <div id="modal-focus-editor">
        <textarea id="focus-editor-textarea"></textarea>
        <button id="close-focus-editor-btn"></button>
        <button id="btn-focus-editor-cancel"></button>
        <button id="btn-focus-editor-done"></button>
        <button id="btn-focus-template-txt"></button>
        <button id="btn-focus-template-json"></button>
        <input type="file" id="input-focus-import-file" />
      </div>
    `;

    mockQuizUIController = {
      loadCustomQuiz: vi.fn()
    };

    mockAppNavController = {
      navigateTo: vi.fn(),
      openModalById: vi.fn(),
      closeModalById: vi.fn()
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

  it("should insert JSON template", () => {
    const btn = document.getElementById("btn-editor-template-json");
    controller.editorTextarea.value = "";
    btn.click();
    expect(controller.editorTextarea.value).toBe("JSON_TEMPLATE_DATA");

    controller.editorTextarea.value = "Existing";
    prompts.confirmAction.mockReturnValueOnce(true);
    btn.click();
    expect(controller.editorTextarea.value).toBe("JSON_TEMPLATE_DATA");
  });

  it("should cancel template insert if user declines confirmation", () => {
    const txtBtn = document.getElementById("btn-editor-template-txt");
    controller.editorTextarea.value = "Preserve text";
    prompts.confirmAction.mockReturnValueOnce(false);
    txtBtn.click();
    expect(controller.editorTextarea.value).toBe("Preserve text");

    const jsonBtn = document.getElementById("btn-editor-template-json");
    prompts.confirmAction.mockReturnValueOnce(false);
    jsonBtn.click();
    expect(controller.editorTextarea.value).toBe("Preserve text");
  });

  it("should handle clear button when empty, confirmed, and cancelled", () => {
    const clearBtn = document.getElementById("btn-editor-clear");
    // Empty
    controller.editorTextarea.value = "";
    clearBtn.click();
    expect(prompts.confirmAction).not.toHaveBeenCalled();

    // Cancelled
    controller.editorTextarea.value = "Content to keep";
    prompts.confirmAction.mockReturnValueOnce(false);
    clearBtn.click();
    expect(controller.editorTextarea.value).toBe("Content to keep");

    // Confirmed
    prompts.confirmAction.mockReturnValueOnce(true);
    clearBtn.click();
    expect(controller.editorTextarea.value).toBe("");
  });

  it("should handle cancel button", () => {
    const cancelBtn = document.getElementById("btn-editor-cancel");
    cancelBtn.click();
    expect(mockAppNavController.navigateTo).toHaveBeenCalledWith("start");
  });

  it("should handle expand focus modal", () => {
    const expandBtn = document.getElementById("btn-focus-editor-expand");
    controller.editorTextarea.value = "Editor text for expand";
    const openSpy = vi.spyOn(controller.fullscreenModal, "open");
    expandBtn.click();
    expect(openSpy).toHaveBeenCalled();
  });

  it("should handle empty data on parseEditorData and exportEditorData", () => {
    controller.editorTextarea.value = "   ";
    controller.parseEditorData();
    expect(controller.editorStatus.textContent).toBe(
      "Please provide data to parse."
    );

    controller.exportEditorData();
    expect(controller.editorStatus.textContent).toBe("No data to export.");
  });

  it("should handle error in exportEditorData", () => {
    controller.editorTextarea.value = "Invalid Content";
    schemaValidator.parseAndValidateRawText.mockImplementationOnce(() => {
      throw new Error("Export parse error");
    });
    controller.exportEditorData();
    expect(controller.editorStatus.textContent).toContain(
      "Error: Cannot export invalid data"
    );
  });

  it("should evaluate hasExistingData correctly", () => {
    controller.editorTextarea.value = "";
    expect(controller.hasExistingData()).toBe(false);
    controller.editorTextarea.value = "Some text";
    expect(controller.hasExistingData()).toBe(true);
  });

  it("should handle file import on change", async () => {
    const importInput = document.getElementById("input-editor-import-file");
    const fakeFile = new File(['Q="Test"\nA="Ans"\nD="Dist"'], "quiz.txt", {
      type: "text/plain"
    });

    Object.defineProperty(importInput, "files", {
      value: [fakeFile],
      writable: true
    });
    fileIO.readFile.mockResolvedValueOnce("Imported File Content");

    controller.editorTextarea.value = "";
    importInput.dispatchEvent(new Event("change"));
    await Promise.resolve();

    expect(controller.editorTextarea.value).toBe("Imported File Content");

    // With existing content - confirmed
    controller.editorTextarea.value = "Old text";
    prompts.confirmAction.mockReturnValueOnce(true);
    fileIO.readFile.mockResolvedValueOnce("New File Content");
    Object.defineProperty(importInput, "files", {
      value: [fakeFile],
      writable: true
    });
    importInput.dispatchEvent(new Event("change"));
    await Promise.resolve();
    expect(controller.editorTextarea.value).toBe("New File Content");

    // With existing content - cancelled
    controller.editorTextarea.value = "Preserved text";
    prompts.confirmAction.mockReturnValueOnce(false);
    Object.defineProperty(importInput, "files", {
      value: [fakeFile],
      writable: true
    });
    importInput.dispatchEvent(new Event("change"));
    await Promise.resolve();
    expect(controller.editorTextarea.value).toBe("Preserved text");

    // File read error
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    fileIO.readFile.mockRejectedValueOnce(new Error("Read Error"));
    Object.defineProperty(importInput, "files", {
      value: [fakeFile],
      writable: true
    });
    importInput.dispatchEvent(new Event("change"));
    // wait a couple of ticks for async catch block
    await new Promise(setImmediate);
    expect(controller.editorTextarea.value).toBe("Preserved text");
    errorSpy.mockRestore();
  });

  it("should update editorTextarea when fullscreenModal onSave callback is invoked", () => {
    let capturedCallback;
    vi.spyOn(controller.fullscreenModal, "open").mockImplementation(
      (text, cb) => {
        capturedCallback = cb;
      }
    );

    document.getElementById("btn-focus-editor-expand").click();
    expect(capturedCallback).toBeDefined();

    capturedCallback("Updated from fullscreen modal");
    expect(controller.editorTextarea.value).toBe(
      "Updated from fullscreen modal"
    );
  });

  it("should throw error if editor-textarea is missing on constructor", () => {
    document.getElementById("editor-textarea").remove();
    expect(
      () => new EditorUIController(mockQuizUIController, mockAppNavController)
    ).toThrow("Missing DOM node: editor-textarea");
  });

  it("should throw error if editor-textarea is not a HTMLTextAreaElement", () => {
    const originalGetEl = globalThis.document.getElementById;
    globalThis.document.getElementById = (id) => {
      if (id === "editor-textarea") {
        const div = document.createElement("div");
        div.id = id;
        return div;
      }
      return originalGetEl(id);
    };

    expect(
      () => new EditorUIController(mockQuizUIController, mockAppNavController)
    ).toThrow("editor-textarea element not found or not a textarea");

    globalThis.document.getElementById = originalGetEl;
  });

  it("should return early when import input has no files", () => {
    const importInput = document.getElementById("input-editor-import-file");
    Object.defineProperty(importInput, "files", {
      value: [],
      writable: true
    });
    importInput.dispatchEvent(new Event("change"));
    expect(fileIO.readFile).not.toHaveBeenCalled();
  });
});
