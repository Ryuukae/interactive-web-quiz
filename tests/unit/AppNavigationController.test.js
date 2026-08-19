import { describe, it, expect, beforeEach } from "vitest";
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
      }
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
      }
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
              if (id === "creation-mode-modal" || id === "modal-backdrop") {
                modalActive = true;
              } else {
                activeScreenId = id;
              }
            },
            remove: () => {
              if (id === "creation-mode-modal" || id === "modal-backdrop") {
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
      }
    };

    const nav = new AppNavigationController();

    // Trigger clicks
    mockElements["create-quizset-btn"].listeners["click"]();
    expect(modalActive).toBe(true);

    mockElements["btn-use-builder"].listeners["click"]();
    expect(modalActive).toBe(false);
    expect(activeScreenId).toBe("creator-screen");

    mockElements["btn-use-editor"].listeners["click"]();
    expect(modalActive).toBe(false);
    expect(activeScreenId).toBe("editor-screen");

    mockElements["btn-cancel-create"].listeners["click"]();
    expect(activeScreenId).toBe("start-screen");

    mockElements["return-start-btn"].listeners["click"]();
    expect(activeScreenId).toBe("start-screen");

    mockElements["return-builder-btn"].listeners["click"]();
    expect(activeScreenId).toBe("creator-screen");
  });

  it("should ignore missing or invalid button elements cleanly", () => {
    globalThis.document = {
      getElementById: (id) => null
    };
    const nav = new AppNavigationController();
    expect(nav).toBeDefined();
    nav.navigateTo("quiz"); // Hits the if (screen) false branch

    globalThis.document = {
      getElementById: (id) => {
        const el = new globalThis.HTMLElement();
        el.id = id;
        el.setAttribute = () => {};
        el.addEventListener = () => {};
        return el;
      }
    };
    const nav2 = new AppNavigationController();
    expect(nav2).toBeDefined();
  });
});
