import { describe, expect, it } from "vitest";
import { filesMatching } from "./sources";

describe("leftovers in src", () => {
  it("has no debug output", () => {
    expect(filesMatching(/\bconsole\.(log|debug|trace)\s*\(/), "remove these console calls").toEqual([]);
  });

  it("has no debugger statements", () => {
    expect(filesMatching(/\bdebugger\b/), "remove these debugger statements").toEqual([]);
  });

  it("opens no browser dialogs: the site uses toasts and its own modal", () => {
    expect(filesMatching(/\b(window\.)?(alert|confirm|prompt)\s*\(/), "replace these dialogs").toEqual([]);
  });

  it("never injects raw HTML", () => {
    expect(filesMatching(/dangerouslySetInnerHTML/), "React escapes text; do not bypass it").toEqual([]);
  });
});
