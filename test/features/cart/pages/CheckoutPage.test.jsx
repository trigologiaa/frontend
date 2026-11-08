import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { App } from "../../../../src/App";
import { CheckoutPage } from "../../../../src/features/cart/pages/CheckoutPage";
import { failOrderWrites, makeService, storedOrders } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

function line(n, quantity = 1) {
  const { id, title, image } = makeService(n);
  return { id, title, image, price: 100 * n, quantity };
}

async function fill(user, { email = "ana@example.com" } = {}) {
  await user.type(screen.getByLabelText("Nombre"), "Ana");
  await user.type(screen.getByLabelText("Correo electrónico"), email);
  await user.type(screen.getByLabelText("Teléfono"), "+54 11 5555 5555");
}

describe("CheckoutPage", () => {
  it("sends an empty cart back to the cart page", async () => {
    renderWithProviders(<App />, { route: "/checkout" });
    expect(await screen.findByRole("heading", { level: 1, name: "Carrito" })).toBeInTheDocument();
  });

  it("shows the buyer form and the total", async () => {
    renderWithProviders(<CheckoutPage />, { initialCart: [line(1, 2)] });
    expect(screen.getByRole("heading", { level: 1, name: "Finalizar compra" })).toBeInTheDocument();
    expect(screen.getByLabelText("Nombre")).toHaveAttribute("autocomplete", "name");
    expect(screen.getByLabelText("Correo electrónico")).toBeInTheDocument();
    expect(screen.getByLabelText("Teléfono")).toBeInTheDocument();
    expect(screen.getByText(/^Total: US\$\s200$/)).toBeInTheDocument();
    await waitFor(() => expect(document.title).toBe("Finalizar compra | Trigologiaa Dev"));
  });

  it("rejects invalid data, focuses the first error and creates no order", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutPage />, { initialCart: [line(1)] });
    await fill(user, { email: "no-es-un-correo" });
    await user.click(screen.getByRole("button", { name: "Confirmar compra" }));
    expect(screen.getByLabelText("Correo electrónico")).toHaveAccessibleDescription(
      "Ingresá un correo válido",
    );
    expect(screen.getByLabelText("Correo electrónico")).toHaveFocus();
    expect(storedOrders()).toHaveLength(0);
  });

  it("removes an error as soon as it is fixed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CheckoutPage />, { initialCart: [line(1)] });
    await user.click(screen.getByRole("button", { name: "Confirmar compra" }));
    const name = screen.getByLabelText("Nombre");
    expect(name).toHaveAttribute("aria-invalid", "true");
    await user.type(name, "Ana");
    expect(name).not.toHaveAttribute("aria-invalid");
  });

  it("creates the order with a snapshot, shows its number and empties the cart", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/checkout", initialCart: [line(1, 2), line(2)] });
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Confirmar compra" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Tu número de orden es doc-1");
    const [order] = storedOrders();
    expect(order.buyer).toEqual({ name: "Ana", email: "ana@example.com", phone: "+54 11 5555 5555" });
    expect(order.items).toEqual([
      { id: "service-1", title: makeService(1).title, price: 100, quantity: 2 },
      { id: "service-2", title: makeService(2).title, price: 200, quantity: 1 },
    ]);
    expect(order.total).toBe(400);
    expect(screen.getByRole("link", { name: "Volver al inicio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Carrito" })).toHaveAttribute("aria-label", "Carrito");
  });

  it("keeps the cart and shows an alert when the order cannot be saved", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/checkout", initialCart: [line(1)] });
    failOrderWrites();
    await fill(user);
    await user.click(screen.getByRole("button", { name: "Confirmar compra" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("No pudimos registrar tu compra");
    expect(screen.getByRole("link", { name: "Carrito, 1 artículo" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Confirmar compra" })).toBeEnabled();
  });
});
