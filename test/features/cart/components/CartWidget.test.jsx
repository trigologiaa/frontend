import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartWidget } from "../../../../src/features/cart/components/CartWidget";
import { renderWithProviders } from "../../../renderWithProviders";

describe("CartWidget", () => {
  it("is a link to the cart page", () => {
    renderWithProviders(<CartWidget />);
    expect(screen.getByRole("link", { name: /Carrito/ })).toHaveAttribute("href", "/carrito");
  });

  it("shows the total quantity of the cart", () => {
    renderWithProviders(<CartWidget />, { cart: { totalQuantity: 5 } });
    expect(screen.getByText("5")).toBeInTheDocument();
  });
});
