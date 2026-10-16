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

  it("lists each service in the cart", () => {
    renderWithProviders(<CartPage />, { initialCart: [line(1), line(2)] });
    expect(screen.getByRole("heading", { name: "Servicio 1" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Servicio 2" })).toBeInTheDocument();
  });

  it("shows the total of the cart", () => {
    renderWithProviders(<CartPage />, { initialCart: [line(1, 2), line(2, 1)] });
    expect(screen.getByText("Total: US$ 400")).toBeInTheDocument();
  });

  it("removes a service and updates the total", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />, { initialCart: [line(1), line(2)] });
    await user.click(screen.getByRole("button", { name: "Quitar Servicio 1" }));
    expect(screen.queryByRole("heading", { name: "Servicio 1" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Servicio 2" })).toBeInTheDocument();
    expect(screen.getByText("Total: US$ 200")).toBeInTheDocument();
  });
});
