import { describe, expect, it } from "vitest";
import {
  cartReducer,
  selectTotalPrice,
  selectTotalQuantity,
} from "../../../src/features/cart/cartReducer";
import { makeService } from "../../handlers";

const { id, title, price, image } = makeService(1);

const makeItem = (n, quantity) => ({
  id: `s${n}`,
  title,
  price: 100 * n,
  image,
  quantity,
});

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

  it("leaves the other items untouched when a quantity accumulates", () => {
    const one = cartReducer([], { type: "add", service: makeService(1), quantity: 1 });
    const two = cartReducer(one, { type: "add", service: makeService(2), quantity: 1 });
    const state = cartReducer(two, { type: "add", service: makeService(1), quantity: 2 });
    expect(state.map((item) => [item.id, item.quantity])).toEqual([
      ["service-1", 3],
      ["service-2", 1],
    ]);
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

  it("clears the whole cart", () => {
    const one = cartReducer([], { type: "add", service: makeService(1), quantity: 1 });
    const two = cartReducer(one, { type: "add", service: makeService(2), quantity: 1 });
    expect(cartReducer(two, { type: "clear" })).toEqual([]);
  });

  it("returns the same state for an unknown action", () => {
    const state = [];
    expect(cartReducer(state, { type: "unknown" })).toBe(state);
  });

  it.each([0, -1, 1.5])("ignores a quantity of %s", (quantity) => {
    const state = cartReducer([], { type: "add", service: makeService(1), quantity });
    expect(state).toEqual([]);
  });

  it("never mutates the previous state", () => {
    const previous = Object.freeze([Object.freeze({ id, title, price, image, quantity: 1 })]);
    const state = cartReducer(previous, { type: "add", service: makeService(1), quantity: 2 });
    expect(previous[0].quantity).toBe(1);
    expect(state[0].quantity).toBe(3);
  });
});

describe("selectTotalQuantity", () => {
  it("sums the quantity of every item", () => {
    expect(selectTotalQuantity([makeItem(1, 2), makeItem(2, 3)])).toBe(5);
  });
});

describe("selectTotalPrice", () => {
  it("sums price times quantity of every item", () => {
    expect(selectTotalPrice([makeItem(1, 2), makeItem(2, 3)])).toBe(800);
  });
});
