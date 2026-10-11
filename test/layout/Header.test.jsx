import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../renderWithProviders";
import { Header } from "../../src/layout/Header";

describe("Header", () => {
  it("shows the brand as a link to the home page inside the banner", () => {
    renderWithProviders(<Header />);
    const brand = within(screen.getByRole("banner")).getByRole("link", { name: "Trigologiaa Dev" });
    expect(brand).toHaveAttribute("href", "/");
  });
});
