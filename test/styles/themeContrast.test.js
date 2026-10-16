import { describe, expect, it } from "vitest";
import themes from "../../src/styles/themes.css?raw";
import tokens from "../../src/styles/tokens.css?raw";
import { contrast, resolve } from "./contrast";
import { FLAVORS, parseFlavors } from "./themeCss";
import { parseSemanticTokens } from "./semanticTokens";

const flavors = parseFlavors(themes);
const semantic = parseSemanticTokens(tokens);

const REQUIRED = [
  "--color-background",
  "--color-surface",
  "--color-text",
  "--color-muted",
  "--color-border",
  "--color-primary",
  "--color-primary-contrast",
  "--color-danger",
  "--color-danger-surface",
];

// [foreground, background]: the pairs the components really render as text.
const TEXT_PAIRS = [
  ["--color-text", "--color-background"],
  ["--color-text", "--color-surface"],
  ["--color-text", "--color-danger-surface"],
  ["--color-muted", "--color-background"],
  ["--color-muted", "--color-surface"],
  ["--color-primary", "--color-background"],
  ["--color-primary-contrast", "--color-primary"],
  ["--color-danger", "--color-background"],
];

describe("semantic tokens", () => {
  it.each(REQUIRED)("defines %s on top of the palette", (name) => {
    expect(semantic[name]).toMatch(/var\(--ctp-\w+\)/);
  });

  it("does not repeat raw colors: the palette lives in themes.css", () => {
    expect(tokens.replace(/\/\*[\s\S]*?\*\//g, "")).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
  });
});

describe.each(FLAVORS)("contrast in %s", (flavor) => {
  const color = (token) => resolve(semantic[token], flavors[flavor].colors);

  it.each(TEXT_PAIRS)("keeps %s readable on %s (AA, 4.5:1)", (foreground, background) => {
    expect(contrast(color(foreground), color(background))).toBeGreaterThanOrEqual(4.5);
  });
});
