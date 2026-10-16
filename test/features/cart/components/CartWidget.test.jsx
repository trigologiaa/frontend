import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { CartWidget } from "../../../../src/features/cart/components/CartWidget";
import { ItemDetail } from "../../../../src/features/services/components/ItemDetail";
import { makeService } from "../../../handlers";
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

  it("shows no number when the cart is empty", () => {
    renderWithProviders(<CartWidget />);
    expect(screen.getByRole("link", { name: /Carrito/ })).toHaveTextContent(/^Carrito$/);
  });

  it("updates when a service is added, without reloading", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <CartWidget />
        <ItemDetail service={makeService(1)} />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(screen.getByRole("link", { name: /Carrito/ })).toHaveTextContent("2");
  });

  it.each([
    [1, "Carrito, 1 artículo"],
    [3, "Carrito, 3 artículos"],
  ])("names the link with the count when the cart has %s units", (totalQuantity, name) => {
    renderWithProviders(<CartWidget />, { cart: { totalQuantity } });
    expect(screen.getByRole("link", { name })).toBeInTheDocument();
  });
});
