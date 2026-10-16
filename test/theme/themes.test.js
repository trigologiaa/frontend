import { describe, expect, it } from "vitest";
import {
  isTheme,
  resolveInitialTheme,
  systemTheme,
  THEME_STORAGE_KEY,
  THEMES,
} from "../../src/theme/themes";

describe("themes", () => {
  it("lists the four Catppuccin flavors from light to darkest", () => {
    expect(THEMES).toEqual(["latte", "frappe", "macchiato", "mocha"]);
  });

  it("stores the choice under the 'theme' key", () => {
    expect(THEME_STORAGE_KEY).toBe("theme");
  });

  it.each(THEMES)("recognizes %s as a theme", (theme) => {
    expect(isTheme(theme)).toBe(true);
  });

  it.each(["neon", "", null, undefined, "Mocha", 3])("rejects %s", (value) => {
    expect(isTheme(value)).toBe(false);
  });

  it("uses Latte when the system prefers light and Mocha otherwise", () => {
    expect(systemTheme(true)).toBe("latte");
    expect(systemTheme(false)).toBe("mocha");
  });

  it("prefers a valid stored theme over the system", () => {
    expect(resolveInitialTheme({ stored: "frappe", prefersLight: true })).toBe("frappe");
    expect(resolveInitialTheme({ stored: "mocha", prefersLight: true })).toBe("mocha");
  });

  it("falls back to the system when nothing valid is stored", () => {
    expect(resolveInitialTheme({ stored: null, prefersLight: true })).toBe("latte");
    expect(resolveInitialTheme({ stored: "neon", prefersLight: false })).toBe("mocha");
  });
});
