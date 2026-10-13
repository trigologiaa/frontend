import { describe, expect, it } from "vitest";
import global from "../../src/styles/global.css?raw";

describe("global styles", () => {
  it("keeps a visible keyboard focus", () => {
    expect(global).toContain(":focus-visible");
    expect(global).not.toMatch(/outline:\s*(none|0)\b/);
  });
});
