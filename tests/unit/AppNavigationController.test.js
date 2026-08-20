import { describe, it, expect, beforeEach, vi } from "vitest";
import AppNavigationController from "../../src/js/controllers/AppNavigationController.js";

describe("AppNavigationController Unit Tests", () => {
  beforeEach(() => {
    globalThis.HTMLElement = class HTMLElement {};
    globalThis.HTMLButtonElement = class HTMLButtonElement extends (
      globalThis.HTMLElement
    ) {};

    globalThis.document = {
      getElementById: (id) => {
        const isBtn = id.includes("btn");
        const el = isBtn
          ? new globalThis.HTMLButtonElement()
          : new globalThis.HTMLElement();
        el.id = id;
        el.classList = {
          add: () => {},
          remove: () => {},
          toggle: () => {}
        };
        el.addEventListener = () => {};
        el.setAttribute = () => {};
        return el;
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {}
    };
  });

  it("should initialize screen navigation nodes cleanly", () => {
    const nav = new AppNavigationController();
    expect(Object.keys(nav.screens)).toHaveLength(5);
  });

  it("should update active screen when navigateTo is called", () => {
    let activeScreenId = "start";
    globalThis.document = {
      getElementById: (id) => {
        const isBtn = id.includes("btn");
        const el = isBtn
          ? new globalThis.HTMLButtonElement()
          : new globalThis.HTMLElement();
        el.id = id;
        el.classList = {
          add: () => {
            activeScreenId = id;
          },
          remove: () => {},
          toggle: (className, force) => {
            if (force) activeScreenId = id;
          }
        };
        el.addEventListener = () => {};
        el.setAttribute = () => {};
        return el;
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {}
    };

    const nav = new AppNavigationController();

    nav.navigateTo("quiz");
    expect(activeScreenId).toBe("quiz-screen");

    nav.navigateTo("creator");
    expect(activeScreenId).toBe("creator-screen");
  });

  it("should warn and ignore invalid screen names cleanly", () => {
    const nav = new AppNavigationController();
    expect(() => nav.navigateTo("invalid-screen")).not.toThrow();
  });

  it("should return early if navigating to the currently active screen", () => {
    const nav = new AppNavigationController();
    nav.navigateTo("quiz");
    expect(() => nav.navigateTo("quiz")).not.toThrow();
  });

  it("should route correctly on button clicks", () => {
    let mockElements = {};
    let activeScreenId = "start";
    let activeModalId = null;
    let modalActive = false;
    globalThis.document = {
      getElementById: (id) => {
        if (!mockElements[id]) {
          const isBtn = id.includes("btn");
          const el = isBtn
            ? new globalThis.HTMLButtonElement()
            : new globalThis.HTMLElement();
          el.id = id;
          el.classList = {
            add: () => {
              if (id.includes("modal") && id !== "modal-backdrop") {
                activeModalId = id;
                modalActive = true;
              } else if (!id.includes("backdrop")) {
                activeScreenId = id;
              }
            },
            remove: () => {
              if (id.includes("modal") && id !== "modal-backdrop") {
                if (activeModalId === id) activeModalId = null;
                modalActive = false;
              }
            },
            toggle: (className, force) => {
              if (force) activeScreenId = id;
            }
          };
          el.listeners = {};
          el.addEventListener = (evt, cb) => {
            el.listeners[evt] = cb;
          };
          el.setAttribute = () => {};
          mockElements[id] = el;
        }
        return mockElements[id];
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {}
    };

    const nav = new AppNavigationController();

    // Trigger clicks
    mockElements["btn-open-txt-guide"].listeners["click"]();
    expect(activeModalId).toBe("modal-guide-txt");

    mockElements["btn-open-json-guide"].listeners["click"]();
    expect(activeModalId).toBe("modal-guide-json");

    mockElements["btn-cancel-create"].listeners["click"]();
    expect(activeScreenId).toBe("start-screen");

    mockElements["return-start-btn"].listeners["click"]();
    expect(activeScreenId).toBe("start-screen");

    mockElements["return-builder-btn"].listeners["click"]();
    expect(activeScreenId).toBe("creator-screen");

    mockElements["quiz-return-builder-btn"].listeners["click"]();
    expect(activeScreenId).toBe("creator-screen");
  });

  it("should ignore missing or invalid button elements cleanly", () => {
    globalThis.document = {
      getElementById: (id) => null,
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {}
    };
    const nav = new AppNavigationController();
    expect(nav).toBeDefined();
    nav.navigateTo("quiz"); // Hits the if (screen) false branch
    nav.openModalById("test-modal"); // Hits missing targetModal and backdrop branches
    nav.closeModalById("test-modal"); // Hits missing targetModal and backdrop branches
    nav.closeAllModals(); // Hits missing backdrop branch

    globalThis.document = {
      getElementById: (id) => {
        const el = new globalThis.HTMLElement();
        el.id = id;
        el.setAttribute = () => {};
        el.addEventListener = () => {};
        return el;
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {}
    };
    const nav2 = new AppNavigationController();
    expect(nav2).toBeDefined();
  });

  it("should apply dynamic container sizing modifier classes on route change", () => {
    const activeClasses = new Set();
    const mockContainer = new globalThis.HTMLElement();
    mockContainer.classList = {
      remove: (...cls) => cls.forEach((c) => activeClasses.delete(c)),
      add: (cls) => activeClasses.add(cls)
    };

    globalThis.document.querySelector = (sel) => {
      if (sel === ".container") return mockContainer;
      return null;
    };

    const nav = new AppNavigationController();

    nav.navigateTo("creator");
    expect(activeClasses.has("screen-creator")).toBe(true);
    expect(activeClasses.has("screen-start")).toBe(false);

    nav.navigateTo("quiz");
    expect(activeClasses.has("screen-quiz")).toBe(true);
    expect(activeClasses.has("screen-creator")).toBe(false);
  });

  it("should handle backdrop click, modal close buttons, and Escape keydown", () => {
    let keydownCb;
    let backdropCb;
    let closeBtnCb;

    const mockBackdrop = new globalThis.HTMLElement();
    mockBackdrop.id = "modal-backdrop";
    mockBackdrop.classList = { remove: vi.fn(), add: vi.fn() };
    mockBackdrop.addEventListener = (evt, cb) => {
      if (evt === "click") backdropCb = cb;
    };

    const mockCloseBtn = new globalThis.HTMLElement();
    mockCloseBtn.classList = { remove: vi.fn(), add: vi.fn() };
    mockCloseBtn.addEventListener = (evt, cb) => {
      if (evt === "click") closeBtnCb = cb;
    };

    globalThis.document = {
      getElementById: (id) => {
        if (id === "modal-backdrop") return mockBackdrop;
        return null;
      },
      querySelectorAll: (sel) => {
        if (sel === ".modal-close-btn") return [mockCloseBtn];
        return [];
      },
      querySelector: () => null,
      addEventListener: (evt, cb) => {
        if (evt === "keydown") keydownCb = cb;
      }
    };

    const nav = new AppNavigationController();
    const closeSpy = vi.spyOn(nav, "closeAllModals");

    if (backdropCb) backdropCb();
    expect(closeSpy).toHaveBeenCalled();

    if (closeBtnCb) closeBtnCb();
    expect(closeSpy).toHaveBeenCalledTimes(2);

    if (keydownCb) keydownCb({ key: "Escape" });
    expect(closeSpy).toHaveBeenCalledTimes(3);

    if (keydownCb) keydownCb({ key: "Enter" });
    expect(closeSpy).toHaveBeenCalledTimes(3);
  });

  it("should handle openModalById and closeModalById cleanly", () => {
    const mockModal = new globalThis.HTMLElement();
    mockModal.id = "test-modal";
    mockModal.classList = { add: vi.fn(), remove: vi.fn() };
    mockModal.addEventListener = vi.fn();

    const mockBackdrop = new globalThis.HTMLElement();
    mockBackdrop.id = "modal-backdrop";
    mockBackdrop.classList = { add: vi.fn(), remove: vi.fn() };
    mockBackdrop.addEventListener = vi.fn();

    globalThis.document = {
      getElementById: (id) => {
        if (id === "test-modal") return mockModal;
        if (id === "modal-backdrop") return mockBackdrop;
        return null;
      },
      querySelectorAll: () => [],
      querySelector: () => null,
      addEventListener: () => {}
    };

    const nav = new AppNavigationController();
    nav.openModalById("test-modal");
    expect(mockModal.classList.add).toHaveBeenCalledWith("active");
    expect(mockBackdrop.classList.add).toHaveBeenCalledWith("active");

    nav.openModalById("non-existent-modal");

    nav.closeModalById("test-modal");
    expect(mockModal.classList.remove).toHaveBeenCalledWith("active");
    expect(mockBackdrop.classList.remove).toHaveBeenCalledWith("active");
  });
});
