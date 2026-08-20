// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import BuilderCardComponent from "../../src/js/components/BuilderCardComponent.js";
import * as prompts from "../../src/js/utils/prompts.js";

vi.mock("../../src/js/utils/prompts.js", () => ({
  confirmAction: vi.fn(() => true)
}));

describe("BuilderCardComponent Unit Tests", () => {
  let onDelete;
  let onExpand;
  let onFocus;

  beforeEach(() => {
    vi.clearAllMocks();
    onDelete = vi.fn();
    onExpand = vi.fn();
    onFocus = vi.fn();
  });

  it("should instantiate a card component with default empty values", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    expect(card.node).toBeDefined();
    expect(card.node.classList.contains("question-card")).toBe(true);
    expect(card.qInput).toBeDefined();
    expect(card.aInput).toBeDefined();
    expect(card.dContainer).toBeDefined();
    expect(card.qInput.value).toBe("");
    expect(card.aInput.value).toBe("");
  });

  it("should prefill card with prefillData.answers array", () => {
    const prefill = {
      question: "Sample Question?",
      answers: [
        { text: "Correct Option", correct: true },
        { text: "Distractor Option", correct: false }
      ]
    };
    const card = new BuilderCardComponent(prefill, onDelete, onExpand, onFocus);
    expect(card.qInput.value).toBe("Sample Question?");
    expect(card.aInput.value).toBe("Correct Option");
    const dInputs = card.dContainer.querySelectorAll(".d-input");
    expect(dInputs).toHaveLength(1);
    expect(dInputs[0].value).toBe("Distractor Option");
  });

  it("should fail validation and render error messages when fields are empty", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    card.qInput.value = "";
    card.aInput.value = "";

    const isValid = card.validate();
    expect(isValid).toBe(false);

    const errorMsgs = card.node.querySelectorAll(".field-error-message");
    expect(errorMsgs.length).toBeGreaterThanOrEqual(2);
    expect(errorMsgs[0].textContent).toContain("Question prompt is required");
  });

  it("should trim edges and pass validation for valid inputs with internal newlines", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    card.qInput.value = "\n\n  Multi-line\nQuestion prompt  \n\n";
    card.aInput.value = "  Correct Answer  ";
    const dInput = card.dContainer.querySelector(".d-input");
    dInput.value = "  Distractor 1  ";

    const isValid = card.validate();
    expect(isValid).toBe(true);
    expect(card.qInput.value).toBe("Multi-line\nQuestion prompt");
    expect(card.aInput.value).toBe("Correct Answer");
    expect(dInput.value).toBe("Distractor 1");

    const errorMsgs = card.node.querySelectorAll(".field-error-message");
    expect(errorMsgs).toHaveLength(0);
  });

  it("should serialize card data properly via getCardData()", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    card.qInput.value = "What is the speed of light?";
    card.aInput.value = "299,792,458 m/s";
    const dInput = card.dContainer.querySelector(".d-input");
    dInput.value = "300,000 km/s";

    const data = card.getCardData();
    expect(data).toEqual({
      question: "What is the speed of light?",
      answers: [
        { text: "299,792,458 m/s", correct: true },
        { text: "300,000 km/s", correct: false }
      ]
    });
  });

  it("should return null from getCardData when question text is empty", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    card.qInput.value = "";
    expect(card.getCardData()).toBeNull();
  });

  it("should call onFocusCallback when focus edit button is clicked", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    const focusBtn = card.node.querySelector(".expand-modal-icon-btn");
    expect(focusBtn).toBeDefined();
    focusBtn.click();
    expect(onFocus).toHaveBeenCalledWith(card);
  });

  it("should collapse the card on construction when prefill data is supplied", () => {
    const prefill = {
      question: "Prefilled question?",
      answers: [
        { text: "Right", correct: true },
        { text: "Wrong", correct: false }
      ]
    };
    const card = new BuilderCardComponent(prefill, onDelete, onExpand, onFocus);
    expect(card.node.classList.contains("collapsed")).toBe(true);
  });

  it("should handle add and remove distractor button clicks", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    expect(card.dContainer.children.length).toBe(1);

    card.addBtn.click();
    expect(card.dContainer.children.length).toBe(2);

    card.removeBtn.click();
    expect(card.dContainer.children.length).toBe(1);
  });

  it("should handle card header toggle", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    const header = card.node.querySelector(".card-header");

    header.click();
    expect(card.node.classList.contains("collapsed")).toBe(true);

    header.click();
    expect(card.node.classList.contains("collapsed")).toBe(false);
    expect(onExpand).toHaveBeenCalledWith(card);
  });

  it("should handle destroy method", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    document.body.appendChild(card.node);
    expect(document.body.contains(card.node)).toBe(true);

    card.destroy();
    expect(document.body.contains(card.node)).toBe(false);
  });

  it("should handle input events and clear errors on typing", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    card.validate(); // triggers field errors

    expect(card.qInput.classList.contains("input-error")).toBe(true);

    card.qInput.value = "New Q";
    card.qInput.dispatchEvent(new Event("input", { bubbles: true }));
    expect(card.qInput.classList.contains("input-error")).toBe(false);

    card.aInput.value = "New A";
    card.aInput.dispatchEvent(new Event("input", { bubbles: true }));
    expect(card.aInput.classList.contains("input-error")).toBe(false);

    const dInput = card.dContainer.querySelector(".d-input");
    dInput.value = "New D";
    dInput.dispatchEvent(new Event("input", { bubbles: true }));
    expect(dInput.classList.contains("input-error")).toBe(false);
  });

  it("should handle clearAllErrors cleanly", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    card.validate();
    card.clearAllErrors();

    expect(card.qInput.classList.contains("input-error")).toBe(false);
    expect(card.aInput.classList.contains("input-error")).toBe(false);
  });

  it("should trigger onDeleteCallback when delete button is clicked and confirmed", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    const deleteBtn = card.node.querySelector(".delete-icon-btn");

    // Confirmed delete
    vi.mocked(prompts.confirmAction).mockReturnValueOnce(true);
    deleteBtn.click();
    expect(onDelete).toHaveBeenCalledWith(card);

    // Cancelled delete
    onDelete.mockClear();
    vi.mocked(prompts.confirmAction).mockReturnValueOnce(false);
    deleteBtn.click();
    expect(onDelete).not.toHaveBeenCalled();
  });

  it("should prefill with correct_answer and distractors array with objects", () => {
    const prefill = {
      question: "Alt Format Question?",
      correct_answer: "Alt Answer",
      distractors: ["D1", { text: "D2" }, "D3", "D4", "D5", "D6"]
    };
    const card = new BuilderCardComponent(prefill, onDelete, onExpand, onFocus);
    expect(card.qInput.value).toBe("Alt Format Question?");
    expect(card.aInput.value).toBe("Alt Answer");
    expect(card.dContainer.children.length).toBe(6);
    expect(card.addBtn.style.display).toBe("none");
  });

  it("should update addBtn and removeBtn display when reaching boundaries", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    expect(card.dContainer.children.length).toBe(1);

    // Add up to 6 distractors
    for (let i = 0; i < 5; i++) {
      card.addBtn.click();
    }
    expect(card.dContainer.children.length).toBe(6);
    expect(card.addBtn.style.display).toBe("none");

    // Attempting to add beyond 6
    card.addBtn.click();
    expect(card.dContainer.children.length).toBe(6);

    // Remove down to 1 distractor
    for (let i = 0; i < 5; i++) {
      card.removeBtn.click();
    }
    expect(card.dContainer.children.length).toBe(1);
    expect(card.removeBtn.style.display).toBe("none");
  });

  it("should ignore input event on non-textarea elements", () => {
    const card = new BuilderCardComponent(null, onDelete, onExpand, onFocus);
    const cardBody = card.node.querySelector(".card-body");
    expect(() =>
      cardBody.dispatchEvent(new Event("input", { bubbles: true }))
    ).not.toThrow();
  });
});
