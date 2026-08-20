// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import FullscreenEditorModalComponent from "../../src/js/components/FullscreenEditorModalComponent.js";
import * as fileIO from "../../src/js/utils/fileIO.js";
import * as prompts from "../../src/js/utils/prompts.js";

vi.mock("../../src/js/utils/templates.js", () => ({
  getTxtTemplate: vi.fn(() => "TXT_TEMPLATE"),
  getJsonTemplate: vi.fn(() => "JSON_TEMPLATE")
}));

vi.mock("../../src/js/utils/fileIO.js", () => ({
  readFile: vi.fn()
}));

vi.mock("../../src/js/utils/prompts.js", () => ({
  confirmAction: vi.fn()
}));

describe("FullscreenEditorModalComponent Unit Tests", () => {
  let mockAppNavController;
  let component;

  beforeEach(() => {
    vi.clearAllMocks();

    document.body.innerHTML = `
      <div id="modal-focus-editor">
        <button id="close-focus-editor-btn"></button>
        <button id="btn-focus-editor-cancel"></button>
        <button id="btn-focus-editor-done"></button>
        <button id="btn-focus-template-txt"></button>
        <button id="btn-focus-template-json"></button>
        <input type="file" id="input-focus-import-file" />
        <textarea id="focus-editor-textarea"></textarea>
      </div>
    `;

    mockAppNavController = {
      openModalById: vi.fn(),
      closeModalById: vi.fn()
    };

    component = new FullscreenEditorModalComponent(mockAppNavController);
  });

  it("should initialize cleanly and cache DOM elements", () => {
    expect(component).toBeDefined();
    expect(component.focusTextarea).toBeDefined();
  });

  it("should open fullscreen editor and set initial text", () => {
    vi.useFakeTimers();
    const onSave = vi.fn();
    component.open("Initial Editor Text", onSave);

    expect(component.focusTextarea.value).toBe("Initial Editor Text");
    expect(mockAppNavController.openModalById).toHaveBeenCalledWith(
      "modal-focus-editor"
    );

    vi.advanceTimersByTime(150);
    vi.useRealTimers();
  });

  it("should commit changes and call onSave callback when done button is clicked", () => {
    const onSave = vi.fn();
    component.open("Initial Text", onSave);

    component.focusTextarea.value = "Updated Fullscreen Text";
    document.getElementById("btn-focus-editor-done").click();

    expect(onSave).toHaveBeenCalledWith("Updated Fullscreen Text");
    expect(mockAppNavController.closeModalById).toHaveBeenCalledWith(
      "modal-focus-editor"
    );
  });

  it("should close without saving when discard button is clicked", () => {
    const onSave = vi.fn();
    component.open("Initial Text", onSave);

    document.getElementById("btn-focus-editor-cancel").click();

    expect(onSave).not.toHaveBeenCalled();
    expect(mockAppNavController.closeModalById).toHaveBeenCalledWith(
      "modal-focus-editor"
    );

    document.getElementById("close-focus-editor-btn").click();
    expect(mockAppNavController.closeModalById).toHaveBeenCalledWith(
      "modal-focus-editor"
    );
  });

  it("should insert TXT template into focus textarea", () => {
    component.focusTextarea.value = "";
    document.getElementById("btn-focus-template-txt").click();
    expect(component.focusTextarea.value).toBe("TXT_TEMPLATE");

    // Overwrite confirmed
    vi.mocked(prompts.confirmAction).mockReturnValueOnce(true);
    document.getElementById("btn-focus-template-txt").click();
    expect(component.focusTextarea.value).toBe("TXT_TEMPLATE");

    // Overwrite cancelled
    vi.mocked(prompts.confirmAction).mockReturnValueOnce(false);
    component.focusTextarea.value = "Preserve text";
    document.getElementById("btn-focus-template-txt").click();
    expect(component.focusTextarea.value).toBe("Preserve text");
  });

  it("should insert JSON template into focus textarea", () => {
    component.focusTextarea.value = "";
    document.getElementById("btn-focus-template-json").click();
    expect(component.focusTextarea.value).toBe("JSON_TEMPLATE");

    // Overwrite confirmed
    vi.mocked(prompts.confirmAction).mockReturnValueOnce(true);
    document.getElementById("btn-focus-template-json").click();
    expect(component.focusTextarea.value).toBe("JSON_TEMPLATE");

    // Overwrite cancelled
    vi.mocked(prompts.confirmAction).mockReturnValueOnce(false);
    component.focusTextarea.value = "Preserve text";
    document.getElementById("btn-focus-template-json").click();
    expect(component.focusTextarea.value).toBe("Preserve text");
  });

  it("should throw error if focus-editor-textarea is missing on constructor", () => {
    document.getElementById("focus-editor-textarea").remove();
    expect(
      () => new FullscreenEditorModalComponent(mockAppNavController)
    ).toThrow("focus-editor-textarea missing or invalid");
  });

  it("should safely initialize when optional buttons are missing", () => {
    document.body.innerHTML = `
      <div id="modal-focus-editor">
        <textarea id="focus-editor-textarea"></textarea>
      </div>
    `;
    // Instantiating with missing optional buttons should not throw
    expect(
      () => new FullscreenEditorModalComponent(mockAppNavController)
    ).not.toThrow();
  });

  it("should close modal on cancel or close button click", () => {
    const cancelBtn = document.getElementById("btn-focus-editor-cancel");
    const closeBtn = document.getElementById("close-focus-editor-btn");

    cancelBtn.click();
    expect(mockAppNavController.closeModalById).toHaveBeenCalledWith(
      "modal-focus-editor"
    );

    closeBtn.click();
    expect(mockAppNavController.closeModalById).toHaveBeenCalledWith(
      "modal-focus-editor"
    );
  });

  it("should trigger onSaveCallback and close on done button click", () => {
    const doneBtn = document.getElementById("btn-focus-editor-done");
    const mockSave = vi.fn();

    component.open("Initial Text", mockSave);
    component.focusTextarea.value = "Edited Text";
    doneBtn.click();

    expect(mockSave).toHaveBeenCalledWith("Edited Text");
    expect(mockAppNavController.closeModalById).toHaveBeenCalledWith(
      "modal-focus-editor"
    );
  });

  it("should handle file import with overwrite prompt and error rejection", async () => {
    const importInput = document.getElementById("input-focus-import-file");
    const fakeFile = new File(['Q="Test"\nA="Ans"\nD="Dist"'], "test.txt", {
      type: "text/plain"
    });

    // Cancel overwrite
    component.focusTextarea.value = "Existing content";
    vi.mocked(prompts.confirmAction).mockReturnValueOnce(false);
    Object.defineProperty(importInput, "files", {
      value: [fakeFile],
      writable: true
    });
    importInput.dispatchEvent(new Event("change"));
    await Promise.resolve();
    expect(component.focusTextarea.value).toBe("Existing content");

    // Successful import
    vi.mocked(prompts.confirmAction).mockReturnValueOnce(true);
    fileIO.readFile.mockResolvedValueOnce("Successfully imported content");
    importInput.dispatchEvent(new Event("change"));
    // wait a couple of ticks for async logic
    await new Promise(setImmediate);
    expect(component.focusTextarea.value).toBe("Successfully imported content");

    // File read error
    component.focusTextarea.value = "";
    vi.mocked(fileIO.readFile).mockRejectedValueOnce(
      new Error("File Read Error")
    );
    Object.defineProperty(importInput, "files", {
      value: [fakeFile],
      writable: true
    });
    importInput.dispatchEvent(new Event("change"));
    await Promise.resolve();
    expect(component.focusTextarea.value).toBe("");
  });

  it("should handle open with null initialText", () => {
    expect(() => component.open("", null)).not.toThrow();
  });

  it("should return early when focus import input has no files", () => {
    const importInput = document.getElementById("input-focus-import-file");
    Object.defineProperty(importInput, "files", {
      value: [],
      writable: true
    });
    importInput.dispatchEvent(new Event("change"));
    expect(fileIO.readFile).not.toHaveBeenCalled();
  });
});
