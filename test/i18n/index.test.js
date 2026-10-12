import { describe, expect, it, vi, afterEach } from "vitest";
import { createI18n } from "../../src/i18n/index";

function browserLanguage(code) {
  vi.spyOn(window.navigator, "languages", "get").mockReturnValue([code]);
  vi.spyOn(window.navigator, "language", "get").mockReturnValue(code);
}

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("createI18n", () => {
  it("translate a key with the default language", () => {
    browserLanguage("fr-FR");
    const i18n = createI18n();
    expect(i18n.t("nav.home")).toBe("Inicio");
  });

  it("uses the browser language when it is English", () => {
    browserLanguage("en-US");
    expect(createI18n().resolvedLanguage).toBe("en");
  });
});
