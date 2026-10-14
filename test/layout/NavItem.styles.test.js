import { describe, expect, it } from "vitest";
import css from "../../src/layout/NavItem.module.css?raw";

describe("NavItem styles", () => {
  it("highlights the current page through aria-current", () => {
    expect(css).toMatch(/\[aria-current=['"]page['"]\]/);
  });
});
