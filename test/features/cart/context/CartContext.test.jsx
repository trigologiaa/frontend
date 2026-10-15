import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CartProvider } from "../../../../src/features/cart/context/CartContext";
import { useCart } from "../../../../src/features/cart/context/useCart";
import { makeService } from "../../../handlers";

function Probe() {
  const { items, totalQuantity, totalPrice, addToCart } = useCart();
  return (
    <>
      <button type="button" onClick={() => addToCart(makeService(1), 2)}>
        add
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
});
