import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CartItem } from "../../../../src/features/cart/components/CartItem";
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
});
