import { describe, expect, it } from "vitest";
import { getProducts } from "../../../../src/features/products/services/productsApi";
import { makeProduct, productsHandler } from "../../../handlers";
import { server } from "../../../server";

describe("getProducts", () => {
  it("returns the products served at /products.json", async () => {
    server.use(
      productsHandler([makeProduct(1), makeProduct(2), makeProduct(3)]),
    );
    const products = await getProducts();
    expect(products).toHaveLength(3);
  });
});
