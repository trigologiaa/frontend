import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useCart } from "../../../../src/features/cart/context/useCart";

describe("useCart", () => {
  it("throws a clear error when used outside the CartProvider", () => {
    expect(() => renderHook(() => useCart())).toThrow(/CartProvider/);
  });
});
