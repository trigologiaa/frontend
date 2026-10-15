import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Item } from "../../../../src/features/services/components/Item";
import es from "../../../../src/i18n/locales/es.json";
import { makeService } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

describe("Item", () => {
  it("shows the title of the service", () => {
    renderWithProviders(<Item service={makeService(1)} />);
    expect(screen.getByRole("heading", { name: "Servicio 1" })).toBeInTheDocument();
  });

  it("shows the image with the title as alternative text", () => {
    renderWithProviders(<Item service={makeService(1)} />);
    const image = screen.getByRole("img", { name: "Servicio 1" });
    expect(image).toHaveAttribute("src", "/images/service-1.svg");
  });

  it("shows the formatted price", () => {
    renderWithProviders(<Item service={makeService(1)} />);
    expect(screen.getByText("US$ 100")).toBeInTheDocument();
  });

  it("shows the category", () => {
    renderWithProviders(<Item service={makeService(1)} />);
    expect(screen.getByText(es.categories.web)).toBeInTheDocument();
  });
});
