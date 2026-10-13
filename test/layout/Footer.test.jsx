import { screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import es from "../../src/i18n/locales/es.json";
import { Footer } from "../../src/layout/Footer";
import { renderWithProviders } from "../renderWithProviders";

describe("Footer", () => {
  it("is a content-info landmark with the company name", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent("© Trigologia Dev");
  });

  it("lists at least three team members", () => {
    renderWithProviders(<Footer />);
    expect(within(screen.getByRole("contentinfo")).getAllByRole("listitem").length).toBeGreaterThanOrEqual(3);
  });

  it("shows the company description and a contact link", () => {
    renderWithProviders(<Footer />);
    const footer = within(screen.getByRole("contentinfo"));
    expect(footer.getByText(es.footer.company.about)).toBeInTheDocument();
    expect(footer.getByRole("link", { name: es.footer.contact })).toHaveAttribute("href", "mailto:hello@trigologiaa.dev");
  });
});
