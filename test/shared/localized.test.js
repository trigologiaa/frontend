import { describe, expect, it } from "vitest";
import { localized } from "../../src/shared/localized";

describe("localized", () => {
  it("picks the text of the requested language", () => {
    expect(localized({ es: "Hola", en: "Hello" }, "en")).toBe("Hello");
  });

  it("falls back to Spanish for any other language", () => {
    expect(localized({ es: "Hola", en: "Hello" }, "fr")).toBe("Hola");
  });
});
