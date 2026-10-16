import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../renderWithProviders";
import { NavBar } from "../../src/layout/NavBar";

describe("NavBar", () => {
  it("is a navigation landmark named 'Navegación principal'", () => {
    renderWithProviders(<NavBar />);
    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument();
  });

  it("links to home, services and cart", () => {
    renderWithProviders(<NavBar />);
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Servicios" })).toHaveAttribute("href", "/servicios");
    expect(screen.getByRole("link", { name: "Carrito" })).toHaveAttribute("href", "/carrito");
  });

  it("marks the current section as the current page", () => {
    renderWithProviders(<NavBar />, { route: "/servicios" });
    expect(screen.getByRole("link", { name: "Servicios" })).toHaveAttribute("aria-current", "page");
  });

  it("does not mark the other sections", () => {
    renderWithProviders(<NavBar />, { route: "/servicios" });
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Carrito" })).not.toHaveAttribute("aria-current");
  });

  it("shows the cart widget with the quantity", () => {
    renderWithProviders(<NavBar />, { cart: { totalQuantity: 2 } });
    expect(screen.getByRole("link", { name: "Carrito, 2 artículos" })).toHaveAttribute("href", "/carrito");
  });
});
