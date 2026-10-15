import { describe, expect, it } from "vitest";
import {
  getProductById,
  getProducts,
} from "../../../../src/features/products/services/productsApi";
import {
  failingProductsHandler,
  makeProduct,
  productsHandler,
} from "../../../handlers";
import { server } from "../../../server";

describe("getProducts", () => {
  it("returns the products served at /products.json", async () => {
    server.use(
      productsHandler([makeProduct(1), makeProduct(2), makeProduct(3)]),
    );
    const products = await getProducts();
    expect(products).toHaveLength(3);
  });

  it("rejects when the server answers with an error", async () => {
    server.use(failingProductsHandler());
    await expect(getProducts()).rejects.toThrow();
  });
});

describe("getProductsById", () => {
  it("returns the product with that id", async () => {
    server.use(productsHandler([makeProduct(1), makeProduct(2)]));
    const product = await getProductById("product-2");
    expect(product).toEqual(makeProduct(2));
  });

  it("returns null when no product has that id", async () => {
    server.use(productsHandler([makeProduct(1)]));
    expect(await getProductById("does-not-exist")).toBeNull();
  });
});
