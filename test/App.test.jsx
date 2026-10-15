import { screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { renderWithProviders } from "./renderWithProviders.jsx";
import { App } from "../src/App.jsx";
import userEvent from "@testing-library/user-event";
import { NavBar } from "../src/layout/NavBar.jsx";
import es from "../src/i18n/locales/es.json";
import { i18n } from "../src/i18n/index.js";
import { makeService, servicesHandler } from "./handlers";
import { server } from "./server";

describe("App routes", () => {
  beforeEach(() => {
    server.use(servicesHandler());
  });

  it("shows the home page inside the layuot at '/'", () => {
    renderWithProviders(<App />, { route: "/" });
    expect(screen.getByRole("heading", { level: 1, name: es.home.title })).toBeInTheDocument();
    expect(within(screen.getByRole("banner")).getByText("Trigologiaa Dev")).toBeInTheDocument();
  });

  it("shows the catalog page at /servicios", () => {
    renderWithProviders(<App />, { route: "/servicios" });
    expect(screen.getByRole("heading", { level: 1, name: "Servicios" })).toBeInTheDocument();
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

  it("goes from the catalog to the detail of a service", async () => {
    const user = userEvent.setup();
    server.use(servicesHandler([makeService(1), makeService(2)]));
    renderWithProviders(<App />, { route: "/servicios" });
    await user.click(await screen.findByRole("link", { name: /Ver detalle.*Servicio 2/ }));
    expect(await screen.findByRole("heading", { level: 1, name: "Servicio 2" })).toBeInTheDocument();
  });

  it("moves the mark when section is followed", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NavBar />, { route: "/" });
    await user.click(screen.getByRole("link", { name: "Carrito" }));
    expect(screen.getByRole("link", { name: "Carrito" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute("aria-current");
  });

  it("keeps the services section marked on a service detail", () => {
    renderWithProviders(<NavBar />, { route: "/servicio/landing-page" });
    expect(screen.getByRole("link", { name: "Servicios" })).toHaveAttribute("aria-current", "page");
  });

  it("shows a not-found message for an unknown address", () => {
    renderWithProviders(<App />, { route: "/esto-no-existe" });
    expect(screen.getByRole("heading", { level: 1, name: /No encontramos esa página/ })).toBeInTheDocument();
  });

  it("keeps the navigation on the not-found page", () => {
    renderWithProviders(<App />, { route: "/esto-no-existe" });
    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument();
  });

  it("keeps the document language in sync with the active language", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />);
    expect(document.documentElement.lang).toBe("es");
    await user.click(screen.getByRole("button", { name: "EN" }));
    expect(document.documentElement.lang).toBe("en");
  });

  it("translates the not-found page", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<App />, { route: "/nope" });
    expect(screen.getByRole("heading", { level: 1, name: /We couldn't find that page/ })).toBeInTheDocument();
  });

  it("goes from the landing page to the catalog with the call to action", async () => {
    const user = userEvent.setup();
    renderWithProviders(<App />, { route: "/" });
    await user.click(screen.getByRole("link", { name: es.home.cta }));
    expect(screen.getByRole("heading", { level: 1, name: es.nav.services })).toBeInTheDocument();
  });
});
