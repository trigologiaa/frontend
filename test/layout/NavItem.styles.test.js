import { describe, expect, it } from "vitest";
import css from "../../src/layout/NavItem.module.css?raw";

describe("NavItem styles", () => {
  it("highlights the current page through aria-current", () => {
    expect(css).toMatch(/\[aria-current=['"]page['"]\]/);
  });

  it("drops the hover background on the current page: the accent is not AA on the surface in Latte", () => {
    expect(css).toMatch(
      /\[aria-current=['"]page['"]\]:hover\s*\{[^}]*background:\s*transparent/,
    );
  });
});
