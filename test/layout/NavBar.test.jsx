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
});
