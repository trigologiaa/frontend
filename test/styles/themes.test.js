import { describe, expect, it } from "vitest";
import themes from "../../src/styles/themes.css?raw";
import { COLORS, FLAVORS, parseFlavors } from "./themeCss";

const flavors = parseFlavors(themes);

const OFFICIAL = {
  latte: { base: "#eff1f5", mantle: "#e6e9ef", crust: "#dce0e8", text: "#4c4f69", mauve: "#8839ef", red: "#d20f39" },
  frappe: { base: "#303446", mantle: "#292c3c", crust: "#232634", text: "#c6d0f5", mauve: "#ca9ee6", red: "#e78284" },
  macchiato: { base: "#24273a", mantle: "#1e2030", crust: "#181926", text: "#cad3f5", mauve: "#c6a0f6", red: "#ed8796" },
  mocha: { base: "#1e1e2e", mantle: "#181825", crust: "#11111b", text: "#cdd6f4", mauve: "#cba6f7", red: "#f38ba8" },
};

describe("Catppuccin palettes", () => {
  it("defines the four flavors", () => {
    expect(Object.keys(flavors).sort()).toEqual([...FLAVORS].sort());
  });

  it.each(FLAVORS)("defines the 26 colors of %s", (flavor) => {
    expect(Object.keys(flavors[flavor].colors).sort()).toEqual([...COLORS].sort());
  });

  it.each(FLAVORS)("uses the official values for %s", (flavor) => {
    for (const [color, value] of Object.entries(OFFICIAL[flavor])) {
      expect(flavors[flavor].colors[color], `${flavor} ${color}`).toBe(value);
    }
  });

  it.each(FLAVORS)("only writes six-digit hex values for %s", (flavor) => {
    for (const value of Object.values(flavors[flavor].colors)) {
      expect(value).toMatch(/^#[0-9a-f]{6}$/);
    }
  });

  it("declares Latte as light and the other flavors as dark", () => {
    expect(flavors.latte.scheme).toBe("light");
    for (const flavor of ["frappe", "macchiato", "mocha"]) {
      expect(flavors[flavor].scheme).toBe("dark");
    }
  });

  it("uses Mocha when no theme is selected", () => {
    expect(flavors.mocha.selector).toMatch(/^:root\s*,\s*:root\[data-theme="mocha"\]$/);
  });
});
