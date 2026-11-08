import { describe, expect, it } from "vitest";

const sources = import.meta.glob("../../src/**/*.{js,jsx}", {
  query: "?raw",
  import: "default",
  eager: true,
});

describe("react-icons imports", () => {
  it("come from one family and name each icon", () => {
    for (const [file, source] of Object.entries(sources)) {
      for (const [, imported, from] of source.matchAll(
        /import\s+([^;]+?)\s+from\s+["'](react-icons[^"']*)["']/g,
      )) {
        expect(from, file).toBe("react-icons/fa6");
        expect(imported, file).toMatch(/^\{[^}]+\}$/);
      }
    }
  });
});
