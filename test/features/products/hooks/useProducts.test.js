import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useProducts } from "../../../../src/features/products/hooks/useProducts";
import { productsHandler, failingProductsHandler } from "../../../handlers";
import { server } from "../../../server";
import { StrictMode } from "react";

describe("useProducts", () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

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

  it("exposes an error when the products cannot be loaded", async () => {
    server.use(failingProductsHandler());
    const { result } = renderHook(() => useProducts());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.products).toEqual([]);
  });

  it("aborts the pending request when the component unmounts", () => {
    server.use(productsHandler());
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { unmount } = renderHook(() => useProducts());
    unmount();
    expect(fetchSpy.mock.calls[0][1]?.signal?.aborted).toBe(true);
  });

  it("does not report cancelled request as an error in StrictMode", async () => {
    server.use(productsHandler());
    const { result } = renderHook(() => useProducts(), { wrapper: StrictMode });
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.products).toHaveLength(3);
  });
});
