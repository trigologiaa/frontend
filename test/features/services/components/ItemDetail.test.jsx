import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ItemDetail } from "../../../../src/features/services/components/ItemDetail";
import { makeService } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

describe("ItemDetail", () => {
  it("shows the title as the main heading", () => {
    renderWithProviders(<ItemDetail service={makeService(1)} />);
    expect(screen.getByRole("heading", { level: 1, name: "Servicio 1" })).toBeInTheDocument();
  });
});
