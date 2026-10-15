import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import es from "../../../../src/i18n/locales/es.json";
import { renderWithProviders } from "../../../renderWithProviders";
import { Home } from "../../../../src/features/home/pages/Home";
import { i18n } from "../../../../src/i18n";

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
    expect(screen.getByRole("link", { name: es.home.cta })).toHaveAttribute("href", "/productos");
  });

  it("shows three highlights under their own heading", () => {
    renderWithProviders(<Home />);
    const section = screen.getByRole("region", { name: es.home.highlights.title });
    expect(within(section).getAllByRole("listitem")).toHaveLength(3);
  });

  it("is translated to English", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<Home />);
    expect(screen.getByRole("heading", { level: 1, name: "Custom software, no fuss" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See services" })).toBeInTheDocument();
  });

  it("sets the browser title to the brand name", () => {
    renderWithProviders(<Home />);
    expect(document.title).toBe("Trigologiaa Dev");
  });
});
