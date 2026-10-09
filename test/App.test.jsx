import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "./renderWithProviders.jsx";
import { App } from "../src/App.jsx";

describe("App routes", () => {
  it("shows the home page inside the layuot at '/'", () => {
    renderWithProviders(<App />, { route: "/" });
    expect(screen.getByRole("heading", { level: 1, name: "Inicio" })).toBeInTheDocument();
    expect(within(screen.getByRole("banner")).getByText("Trigologiaa Dev")).toBeInTheDocument();
  });

  it("shows the catalog page at /productos", () => {
    renderWithProviders(<App />, { route: "/productos" });
    expect(screen.getByRole("heading", { level: 1, name: "Servicios" })).toBeInTheDocument();
  });
});
