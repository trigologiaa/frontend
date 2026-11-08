import { describe, expect, it } from "vitest";
import { paginate } from "../../../src/features/services/paginate";

const numbers = Array.from({ length: 14 }, (_, index) => index + 1);

describe("paginate", () => {
  it("returns the first page", () => {
    expect(paginate(numbers, 1, 6)).toEqual({
      items: [1, 2, 3, 4, 5, 6],
      page: 1,
      totalPages: 3,
    });
  });

  it("returns the rest on the last page", () => {
    expect(paginate(numbers, 3, 6)).toEqual({ items: [13, 14], page: 3, totalPages: 3 });
  });

  it("has one empty page for an empty list", () => {
    expect(paginate([], 1, 6)).toEqual({ items: [], page: 1, totalPages: 1 });
  });

  it("does not add an empty page for an exact multiple", () => {
    expect(paginate(numbers.slice(0, 12), 2, 6).totalPages).toBe(2);
  });

  it.each([0, -3, Number.NaN, 1.7])("falls back to the first page for %s", (page) => {
    expect(paginate(numbers, page, 6).page).toBe(1);
  });

  it("clamps a page past the end to the last page", () => {
    expect(paginate(numbers, 99, 6)).toEqual({ items: [13, 14], page: 3, totalPages: 3 });
  });
});
