import { describe, expect, it } from "vitest";

const styled = import.meta.glob("../../src/**/*.styles.js", {
  query: "?raw",
  import: "default",
  eager: true,
});

describe("styled-components files", () => {
  it("exist", () => {
    expect(Object.keys(styled).length).toBeGreaterThan(0);
  });

  it("never hardcode a color: they use the design tokens", () => {
    for (const [file, source] of Object.entries(styled)) {
      expect(source, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
      expect(source, file).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/);
    }
  });
});
