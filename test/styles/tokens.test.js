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
  ])("defines %s", (name) => {
    expect(tokens).toContain(`${name}:`);
  });
});
