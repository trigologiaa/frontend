import { describe, expect, it } from "vitest";
import tokens from "../../src/styles/tokens.css?raw";

describe("design tokens", () => {
  it.each([
    "--color-primary",
    "--color-background",
    "--color-text",
    "--space-4",
    "--font-size-base",
    "--radius",
    "--color-danger",
    "--color-danger-surface",
  ])("defines %s", (name) => {
    expect(tokens).toContain(`${name}:`);
  });

  it("redefines the palette for the light color scheme", () => {
    expect(tokens).toMatch(/@media \(prefers-color-scheme: light\)/);
  });

  it("respects reduced motion", () => {
    expect(tokens).toMatch(/@media \(prefers-reduced-motion: reduce\)/);
  });
});
