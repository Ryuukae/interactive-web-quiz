import { describe, it, expect, vi, beforeEach } from "vitest";
import { confirmAction, alertAction } from "../../src/js/utils/prompts.js";

describe("prompts Utility Unit Tests", () => {
  beforeEach(() => {
    globalThis.window = {
      confirm: () => true,
      alert: () => {}
    };
  });

  it("should invoke window.confirm and return boolean decision", () => {
    const confirmSpy = vi
      .spyOn(globalThis.window, "confirm")
      .mockReturnValue(true);

    const result = confirmAction("Are you sure?");
    expect(confirmSpy).toHaveBeenCalledWith("Are you sure?");
    expect(result).toBe(true);

    confirmSpy.mockRestore();
  });

  it("should format and invoke window.alert for alertAction", () => {
    const alertSpy = vi
      .spyOn(globalThis.window, "alert")
      .mockImplementation(() => {});

    alertAction("Invalid QAD data block");
    expect(alertSpy).toHaveBeenCalledWith("Invalid QAD data block");

    alertSpy.mockRestore();
  });
});
