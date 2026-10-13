import { describe, expect, it } from "vitest";

const modules = import.meta.glob("../../src/**/*.module.css", {
  query: "?raw",
  import: "default",
  eager: true,
});

describe("component styles", () => {
  it("never hardcode a color: they use the design tokens", () => {
    for (const [file, css] of Object.entries(modules)) {
      expect(css, file).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    }
  });
});
