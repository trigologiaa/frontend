import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CartProvider } from "../../../../src/features/cart/context/CartContext";
import { useCart } from "../../../../src/features/cart/context/useCart";
import { makeService } from "../../../handlers";

function Probe() {
  const {
    items,
    totalQuantity,
    totalPrice,
    addToCart,
    removeFromCart,
    clearCart,
  } = useCart();
  return (
    <>
      <button type="button" onClick={() => addToCart(makeService(1), 2)}>
        add
      </button>
      <button type="button" onClick={() => addToCart(makeService(2), 1)}>
        add other
      </button>
      <button type="button" onClick={() => removeFromCart("service-1")}>
        remove
      </button>
      <button type="button" onClick={clearCart}>
        clear
      </button>
      <p>items: {items.length}</p>
      <p>quantity: {totalQuantity}</p>
      <p>price: {totalPrice}</p>
    </>
  );
}

describe("CartProvider", () => {
  it("shares the cart and its totals with its children", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <Probe />
      </CartProvider>,
    );
    await user.click(screen.getByRole("button", { name: "add" }));
    expect(screen.getByText("items: 1")).toBeInTheDocument();
    expect(screen.getByText("quantity: 2")).toBeInTheDocument();
    expect(screen.getByText("price: 200")).toBeInTheDocument();
  });

  it("removes a service from the cart", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <Probe />
      </CartProvider>,
    );
    await user.click(screen.getByRole("button", { name: "add" }));
    await user.click(screen.getByRole("button", { name: "remove" }));
    expect(screen.getByText("items: 0")).toBeInTheDocument();
  });

  it("clears the cart", async () => {
    const user = userEvent.setup();
    render(
      <CartProvider>
        <Probe />
      </CartProvider>,
    );
    await user.click(screen.getByRole("button", { name: "add" }));
    await user.click(screen.getByRole("button", { name: "add other" }));
    expect(screen.getByText("items: 2")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "clear" }));
    expect(screen.getByText("items: 0")).toBeInTheDocument();
  });

  it("starts with the initial items when they are provided", () => {
    const initialItems = [
      { id: "service-1", title: makeService(1).title, price: 100, image: "", quantity: 2 },
    ];
    render(
      <CartProvider initialItems={initialItems}>
        <Probe />
      </CartProvider>,
    );
    expect(screen.getByText("quantity: 2")).toBeInTheDocument();
  });
});
