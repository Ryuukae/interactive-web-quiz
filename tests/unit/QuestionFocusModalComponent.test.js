// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from "vitest";
import QuestionFocusModalComponent from "../../src/js/components/QuestionFocusModalComponent.js";

describe("QuestionFocusModalComponent Unit Tests", () => {
  let mockAppNavController;
  let component;

  beforeEach(() => {
    vi.clearAllMocks();

    document.body.innerHTML = `
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

    mockAppNavController = {
      openModalById: vi.fn(),
      closeModalById: vi.fn()
    };

    component = new QuestionFocusModalComponent(mockAppNavController);
  });

  it("should initialize DOM references and bind event listeners cleanly", () => {
    expect(component).toBeDefined();
    expect(component.qInput).toBeDefined();
    expect(component.aInput).toBeDefined();
    expect(component.dContainer).toBeDefined();
  });

  it("should safely initialize and handle open with missing optional nodes", () => {
    document.body.innerHTML = `
      <div id="modal-focus-edit">
        <textarea id="focus-modal-q-input"></textarea>
        <textarea id="focus-modal-a-input"></textarea>
        <div id="focus-modal-distractors-container"></div>
      </div>
    `;
    const noBtnComponent = new QuestionFocusModalComponent(
      mockAppNavController
    );
    expect(() => noBtnComponent.open(null)).not.toThrow();
    expect(() =>
      noBtnComponent.open({
        qInput: { value: "Q" },
        aInput: { value: "A" },
        dContainer: document.createElement("div")
      })
    ).not.toThrow();
  });

  it("should open focus modal in create mode when card is null", () => {
    vi.useFakeTimers();
    component.open(null);
    expect(mockAppNavController.openModalById).toHaveBeenCalledWith(
      "modal-focus-edit"
    );
    expect(component.activeFocusCard).toBe(null);

    vi.advanceTimersByTime(150);
    vi.useRealTimers();
  });

  it("should open focus modal populated with card details in edit mode", () => {
    const cardNode = document.createElement("div");
    const dCont = document.createElement("div");
    const dInput = document.createElement("textarea");
    dInput.className = "d-input";
    dInput.value = "Distractor 1";
    dCont.appendChild(dInput);

    const mockCard = {
      node: cardNode,
      qInput: { value: "Question Text?" },
      aInput: { value: "Answer Text" },
      dContainer: dCont
    };

    component.open(mockCard);
    expect(mockAppNavController.openModalById).toHaveBeenCalledWith(
      "modal-focus-edit"
    );
    expect(component.activeFocusCard).toBe(mockCard);
    expect(component.qInput.value).toBe("Question Text?");
    expect(component.aInput.value).toBe("Answer Text");
  });

  it("should validate and call onSave callback when done button is clicked", () => {
    const onSave = vi.fn();
    component.open(null, onSave);

    component.qInput.value = "Valid question prompt?";
    component.aInput.value = "Valid correct answer";

    const dInput = document.createElement("textarea");
    dInput.className = "glass-input d-input";
    dInput.value = "Valid distractor";
    component.dContainer.innerHTML = "";
    component.dContainer.appendChild(dInput);

    document.getElementById("btn-focus-modal-done").click();

    expect(onSave).toHaveBeenCalledWith(
      {
        question: "Valid question prompt?",
        correct_answer: "Valid correct answer",
        distractors: ["Valid distractor"]
      },
      null
    );
    expect(mockAppNavController.closeModalById).toHaveBeenCalledWith(
      "modal-focus-edit"
    );
  });

  it("should block saving if validation fails", () => {
    const onSave = vi.fn();
    component.open(null, onSave);

    component.qInput.value = ""; // Missing prompt
    component.aInput.value = "Valid answer";

    document.getElementById("btn-focus-modal-done").click();

    expect(onSave).not.toHaveBeenCalled();
    expect(mockAppNavController.closeModalById).not.toHaveBeenCalled();
  });

  it("should handle add and remove distractor button clicks", () => {
    component.open(null);
    expect(component.dContainer.children.length).toBe(1);

    document.getElementById("btn-focus-modal-add-distractor").click();
    expect(component.dContainer.children.length).toBe(2);

    document.getElementById("btn-focus-modal-remove-distractor").click();
    expect(component.dContainer.children.length).toBe(1);
  });

  it("should discard edits on cancel or close button click", () => {
    component.open(null);
    document.getElementById("btn-focus-modal-cancel").click();
    expect(mockAppNavController.closeModalById).toHaveBeenCalledWith(
      "modal-focus-edit"
    );

    document.getElementById("close-focus-edit-btn").click();
    expect(mockAppNavController.closeModalById).toHaveBeenCalledWith(
      "modal-focus-edit"
    );
  });

  it("should clear error on input event", () => {
    component.open(null);
    component.setModalFieldError(component.qInput, "Error message");
    expect(component.qInput.classList.contains("input-error")).toBe(true);

    component.modal.dispatchEvent(new Event("input", { bubbles: true }));
    component.qInput.dispatchEvent(new Event("input", { bubbles: true }));
    expect(component.qInput.classList.contains("input-error")).toBe(false);
  });

  it("should fail validation when distractor input is empty in focus modal", () => {
    component.open(null);
    component.qInput.value = "Valid Question";
    component.aInput.value = "Valid Answer";

    const dInput = component.dContainer.querySelector(".d-input");
    dInput.value = "";

    expect(component.validateFocusModal()).toBe(false);
    expect(dInput.classList.contains("input-error")).toBe(true);
  });

  it("should fail validation when correct answer is empty", () => {
    component.open(null);
    component.qInput.value = "Valid Question";
    component.aInput.value = "";

    expect(component.validateFocusModal()).toBe(false);
    expect(component.aInput.classList.contains("input-error")).toBe(true);
  });

  it("should fail validation when distractor bounds are violated (0 or >6)", () => {
    component.open(null);
    component.qInput.value = "Q";
    component.aInput.value = "A";

    // 0 distractors
    component.dContainer.innerHTML = "";
    expect(component.validateFocusModal()).toBe(false);

    // 7 distractors
    for (let i = 0; i < 7; i++) {
      const ta = document.createElement("textarea");
      ta.className = "d-input";
      ta.value = "D" + i;
      component.dContainer.appendChild(ta);
    }
    expect(component.validateFocusModal()).toBe(false);
  });

  it("should return early from open if DOM references are invalid", () => {
    const backupQInput = component.qInput;
    component.qInput = null;
    expect(component.open(null)).toBeUndefined();
    component.qInput = backupQInput;
  });

  it("should update add and remove distractor button visibility at boundaries", () => {
    component.open(null);
    const addBtn = document.getElementById("btn-focus-modal-add-distractor");
    const removeBtn = document.getElementById(
      "btn-focus-modal-remove-distractor"
    );

    // At 1 distractor
    expect(removeBtn.style.display).toBe("none");
    expect(addBtn.style.display).toBe("inline-flex");

    // Add up to 6 distractors
    for (let i = 0; i < 5; i++) {
      addBtn.click();
    }
    expect(component.dContainer.children.length).toBe(6);
    expect(addBtn.style.display).toBe("none");
    expect(removeBtn.style.display).toBe("inline-flex");

    // Clicking add when at 6 should not add more
    addBtn.click();
    expect(component.dContainer.children.length).toBe(6);
  });

  it("should return false in validateFocusModal if essential inputs are missing", () => {
    const invalidComp = new QuestionFocusModalComponent(mockAppNavController);
    invalidComp.qInput = null;
    expect(invalidComp.validateFocusModal()).toBe(false);
  });

  it("should handle clearModalFieldError on null safely", () => {
    expect(() => component.clearModalFieldError(null)).not.toThrow();
  });
});
