import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ItemDetail } from "../../../../src/features/services/components/ItemDetail";
import es from "../../../../src/i18n/locales/es.json";
import { makeService } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

describe("ItemDetail", () => {
  it("shows the title as the main heading", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByRole("heading", { level: 1, name: "Servicio 1" })).toBeInTheDocument();
  });

  it("shows the description", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByText("Descripción 1")).toBeInTheDocument();
  });

  it("shows the price and the category", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByText("US$ 100")).toBeInTheDocument();
    expect(screen.getByText(es.categories.web)).toBeInTheDocument();
  });

  it("shows the image with the title as alternative text", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByRole("img", { name: "Servicio 1" })).toHaveAttribute("src", "/images/service-1.svg");
  });

  it("starts with a quantity of one", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("1");
  });

  it("increases the quantity from the detail", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("3");
  });
});
