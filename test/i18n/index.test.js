import { describe, expect, it } from "vitest";
import { createI18n } from "../../src/i18n/index";

describe("createI18n", () => {
  it("translate a key with the default language", () => {
    const i18n = createI18n();
    expect(i18n.t("nav.home")).toBe("Inicio");
  });
});
