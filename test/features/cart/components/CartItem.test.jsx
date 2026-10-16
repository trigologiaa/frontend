import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CartItem } from "../../../../src/features/cart/components/CartItem";
import { i18n } from "../../../../src/i18n";
import { makeService } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

const { id, title, image } = makeService(1);
const item = { id, title, image, price: 350, quantity: 2 };

describe("CartItem", () => {
  it("shows the title and the image of the service", () => {
    renderWithProviders(<CartItem item={item} onRemove={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Servicio 1" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Servicio 1" })).toHaveAttribute("src", "/images/service-1.svg");
  });

  it("shows the quantity", () => {
    renderWithProviders(<CartItem item={item} onRemove={vi.fn()} />);
    expect(screen.getByText(/Cantidad/)).toHaveTextContent("Cantidad: 2");
  });

  it("shows the unit price and the subtotal of the line", () => {
    renderWithProviders(<CartItem item={item} onRemove={vi.fn()} />);
    expect(screen.getByText("Precio: US$ 350")).toBeInTheDocument();
    expect(screen.getByText("Subtotal: US$ 700")).toBeInTheDocument();
  });

  it("asks to remove the item with a button named after the service", async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    renderWithProviders(<CartItem item={item} onRemove={onRemove} />);
    await user.click(screen.getByRole("button", { name: "Quitar Servicio 1" }));
    expect(onRemove).toHaveBeenCalledWith("service-1");
  });

  it("translates the cart item", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<CartItem item={item} onRemove={vi.fn()} />);
    expect(screen.getByText("Quantity: 2")).toBeInTheDocument();
    expect(screen.getByText("Price: $350")).toBeInTheDocument();
    expect(screen.getByText("Subtotal: $700")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove Service 1" })).toBeInTheDocument();
  });
});
