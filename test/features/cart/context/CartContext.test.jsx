import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CartProvider } from "../../../../src/features/cart/context/CartContext";
import { useCart } from "../../../../src/features/cart/context/useCart";
import { makeService } from "../../../handlers";

function Probe() {
  const { items, totalQuantity, totalPrice, addToCart, removeFromCart } =
    useCart();
  return (
    <>
      <button type="button" onClick={() => addToCart(makeService(1), 2)}>
        add
      </button>
      <button type="button" onClick={() => removeFromCart("service-1")}>
        remove
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
});
