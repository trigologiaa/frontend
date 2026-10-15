import { renderHook, waitFor } from "@testing-library/react";
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

  it("exposes the products once they are loaded", async () => {
    server.use(productsHandler());
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.products).toHaveLength(3);
    expect(result.current.error).toBeNull();
  });
});
