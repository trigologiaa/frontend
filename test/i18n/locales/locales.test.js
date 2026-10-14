import { describe, expect, it } from "vitest";
import en from "../../../src/i18n/locales/en.json";
import es from "../../../src/i18n/locales/es.json";

function flatten(object, prefix = "") {
  return Object.entries(object).flatMap(([key, value]) => {
    return typeof value === "object"
      ? flatten(value, `${prefix}${key}.`)
      : [`${prefix}${key}`];
  });
}

describe("locales", () => {
  it("has the same keys in Spanish and English", () => {
    expect(flatten(en).sort()).toEqual(flatten(es).sort());
  });
});
