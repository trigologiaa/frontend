import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDocumentTitle } from "../../src/shared/useDocumentTitle";

describe("useDocumentTitle", () => {
  it("sets the browser tab title", () => {
    renderHook(() => useDocumentTitle("Trigologiaa Dev"));
    expect(document.title).toBe("Trigologiaa Dev");
  });
});
