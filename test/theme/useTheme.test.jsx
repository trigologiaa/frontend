import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useTheme } from "../../src/theme/useTheme";

describe("useTheme", () => {
  it("throws a clear error when used outside the ThemeProvider", () => {
    expect(() => renderHook(() => useTheme())).toThrow(/ThemeProvider/);
  });
});
