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

  it("keeps different services as separate items", () => {
    const first = cartReducer([], { type: "add", service: makeService(1), quantity: 1 });
    const state = cartReducer(first, { type: "add", service: makeService(2), quantity: 1 });
    expect(state).toHaveLength(2);
  });

  it("removes the whole item of a service", () => {
    const one = cartReducer([], { type: "add", service: makeService(1), quantity: 1 });
    const two = cartReducer(one, { type: "add", service: makeService(2), quantity: 1 });
    const state = cartReducer(two, { type: "remove", id: "service-1" });
    expect(state.map((item) => item.id)).toEqual(["service-2"]);
  });
});
