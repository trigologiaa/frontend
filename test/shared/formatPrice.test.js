import { describe, expect, it } from "vitest";
import { formatPrice } from "../../src/shared/formatPrice";

const plain = (text) => text.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("formats dollars for a Spanish speaker", () => {
    expect(plain(formatPrice(350, "es"))).toBe("US$ 350");
  });
});
