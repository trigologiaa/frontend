import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CartContext } from "../../../../src/features/cart/context/CartContext";
import { useCart } from "../../../../src/features/cart/context/useCart";
import { ItemDetail } from "../../../../src/features/services/components/ItemDetail";
import es from "../../../../src/i18n/locales/es.json";
import { makeService } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

function CartProbe() {
  const { items, totalQuantity } = useCart();
  return (
    <p>
      cart: {items.map((item) => `${item.id} x${item.quantity}`).join(", ")} ({totalQuantity})
    </p>
  );
}

describe("ItemDetail", () => {
  it("shows the title as the main heading", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByRole("heading", { level: 1, name: "Servicio 1" })).toBeInTheDocument();
  });

  it("shows the description", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByText("Descripción 1")).toBeInTheDocument();
  });

  it("shows the price and the category", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByText("US$ 100")).toBeInTheDocument();
    expect(screen.getByText(es.categories.web)).toBeInTheDocument();
  });

  it("shows the image with the title as alternative text", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByRole("img", { name: "Servicio 1" })).toHaveAttribute("src", "/images/service-1.svg");
  });

  it("starts with a quantity of one", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("1");
  });

  it("increases the quantity from the detail", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("3");
  });

  it("decreases the quantity from the detail", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Disminuir cantidad" }));
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("2");
  });

  it("calls addToCart with the service and the chosen quantity", async () => {
    const user = userEvent.setup();
    const addToCart = vi.fn();
    const service = makeService(1);
    renderWithProviders(
      <CartContext.Provider
        value={{
          items: [],
          totalQuantity: 0,
          totalPrice: 0,
          addToCart,
          removeFromCart: vi.fn(),
          clearCart: vi.fn(),
        }}
      >
        <ItemDetail service={service} />
      </CartContext.Provider>,
    );
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(addToCart).toHaveBeenCalledWith(service, 2);
  });

  it("puts the service in the cart", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ItemDetail service={makeService(1)} />
        <CartProbe />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(screen.getByText("cart: service-1 x2 (2)")).toBeInTheDocument();
  });

  it("accumulates repeated additions of the same service", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <ItemDetail service={makeService(1)} />
        <CartProbe />
      </>,
    );
    await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    expect(screen.getByText("cart: service-1 x3 (3)")).toBeInTheDocument();
  });

  it("confirms that the service was added", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    await user.click(screen.getByRole("button", { name: "Agregar al carrito" }));
    const messages = screen.getAllByRole("status").map((node) => node.textContent);
    expect(messages).toContain("Agregado al carrito");
  });
});
