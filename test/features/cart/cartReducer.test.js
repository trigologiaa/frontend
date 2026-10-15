import { describe, expect, it } from "vitest";
import { cartReducer } from "../../../src/features/cart/cartReducer";
import { makeService } from "../../handlers";

const { id, title, price, image } = makeService(1);

describe("cartReducer", () => {
  it("adds a new service as an item with its quantity", () => {
    const state = cartReducer([], { type: "add", service: makeService(1), quantity: 2 });
    expect(state).toEqual([{ id, title, price, image, quantity: 2 }]);
  });

  it("increases the quantity when the service is already in the cart", () => {
    const first = cartReducer([], { type: "add", service: makeService(1), quantity: 1 });
    const state = cartReducer(first, { type: "add", service: makeService(1), quantity: 2 });
    expect(state).toEqual([{ id, title, price, image, quantity: 3 }]);
  });
});
