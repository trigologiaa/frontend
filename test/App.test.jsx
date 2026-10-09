import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "./renderWithProviders.jsx";
import { App } from "../src/App.jsx";
import userEvent from "@testing-library/user-event";

describe("App routes", () => {
  it("shows the home page inside the layuot at '/'", () => {
    renderWithProviders(<App />, { route: "/" });
    expect(screen.getByRole("heading", { level: 1, name: "Inicio" })).toBeInTheDocument();
    expect(within(screen.getByRole("banner")).getByText("Trigologiaa Dev")).toBeInTheDocument();
  });

  it("shows the catalog page at /servicios", () => {
    renderWithProviders(<App />, { route: "/servicios" });
    expect(screen.getByRole("heading", { level: 1, name: "Servicios" })).toBeInTheDocument();
  });

  it("shows the detail page at '/servicio/:id'", () => {
    renderWithProviders(<App />, { route: "/servicio/landing-page" });
    expect(screen.getByRole("heading", { level: 1, name: "Detalle del servicio" })).toBeInTheDocument();
  });

  it("gives the detail page the id from the URL", () => {
    renderWithProviders(<App />, { route: "/servicio/landing-page" });
    expect(screen.getByText("landing-page")).toBeInTheDocument();
  });

  it("shows the cart page at '/carrito'", () => {
    renderWithProviders(<App />, { route: "/carrito" });
    expect(screen.getByRole("heading", { level: 1, name: "Carrito" })).toBeInTheDocument();
  });

  it("changes the page when a navigation link is followed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/" });
    await user.click(screen.getByRole("link", { name: "Servicios" }));
    expect(screen.getByRole("heading", { level: 1, name: "Servicios" })).toBeInTheDocument();
  });
});
