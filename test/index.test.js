import { afterEach, describe, expect, it, vi } from "vitest";
import html from "../index.html?raw";
import { THEMES } from "../src/theme/themes";

const inlineScript = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];

function runInlineScript() {
  new Function(inlineScript)();
}

function systemPrefers(scheme) {
  window.matchMedia = (query) => ({
    matches: query === `(prefers-color-scheme: ${scheme})`,
  });
}

describe("index.html theme script", () => {
  afterEach(() => {
    window.matchMedia = undefined;
    vi.restoreAllMocks();
  });

  it("runs before the application module", () => {
    expect(inlineScript).toBeDefined();
    expect(html.indexOf("<script>")).toBeLessThan(html.indexOf('type="module"'));
  });

  it.each(THEMES)("applies the stored theme %s before the first paint", (theme) => {
    systemPrefers("light");
    localStorage.setItem("theme", theme);
    runInlineScript();
    expect(document.documentElement).toHaveAttribute("data-theme", theme);
  });

  it("uses Latte when nothing is stored and the system prefers light", () => {
    systemPrefers("light");
    runInlineScript();
    expect(document.documentElement).toHaveAttribute("data-theme", "latte");
  });

  it("uses Mocha when nothing is stored and the system prefers dark", () => {
    systemPrefers("dark");
    runInlineScript();
    expect(document.documentElement).toHaveAttribute("data-theme", "mocha");
  });

  it("ignores a stored theme that does not exist", () => {
    systemPrefers("light");
    localStorage.setItem("theme", "neon");
    runInlineScript();
    expect(document.documentElement).toHaveAttribute("data-theme", "latte");
  });

  it("still sets a theme when the storage is blocked", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    runInlineScript();
    expect(document.documentElement).toHaveAttribute("data-theme", "mocha");
  });
});
