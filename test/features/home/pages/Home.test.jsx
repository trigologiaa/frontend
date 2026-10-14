import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import es from "../../../../src/i18n/locales/es.json";
import { renderWithProviders } from "../../../renderWithProviders";
import { Home } from "../../../../src/features/home/pages/Home";

describe("Home", () => {
  it("shows the main heading of the hero", () => {
    renderWithProviders(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: es.home.title })).toBeInTheDocument();
  });

  it("shows the value proposition", () => {
    renderWithProviders(<Home />);
    expect(screen.getByText(es.home.pitch)).toBeInTheDocument();
  });

  it("offers a call to action that links to the catalog", () => {
    renderWithProviders(<Home />);
    expect(screen.getByRole("link", { name: es.home.cta })).toHaveAttribute("href", "/servicios");
  });
});
