import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useProducts } from "../../../../src/features/products/hooks/useProducts";
import { productsHandler } from "../../../handlers";
import { server } from "../../../server";

describe("useProducts", () => {
  it("starts loading with no products and no error", () => {
    server.use(productsHandler());
    const { result } = renderHook(() => useProducts());
    expect(result.current).toEqual({
      products: [],
      loading: true,
      error: null,
    });
  });
});
