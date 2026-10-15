import { describe, expect, it } from "vitest";
import { localized } from "../../src/shared/localized";

describe("localized", () => {
  it("picks the text of the requested language", () => {
    expect(localized({ es: "Hola", en: "Hello" }, "en")).toBe("Hello");
  });
});
