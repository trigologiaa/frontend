import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CartPage } from "../../../../src/features/cart/pages/CartPage";
import { makeService } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

function line(n, quantity = 1) {
  const { id, title, image } = makeService(n);
  return { id, title, image, price: 100 * n, quantity };
}

describe("CartPage", () => {
  it("invites to browse the services when the cart is empty", () => {
    renderWithProviders(<CartPage />);
    expect(screen.getByText("Tu carrito está vacío")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ver servicios" })).toHaveAttribute("href", "/servicios");
  });
});
