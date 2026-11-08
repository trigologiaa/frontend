import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ItemList } from "../../../../src/features/services/components/ItemList";
import { makeService } from "../../../handlers";
import { renderWithProviders } from "../../../renderWithProviders";

describe("ItemList", () => {
  it("renders one item per service", () => {
    renderWithProviders(
      <ItemList services={[makeService(1), makeService(2), makeService(3)]} />,
    );
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("lays the cards out in a responsive grid", () => {
    renderWithProviders(
      <ItemList services={[makeService(1), makeService(2), makeService(3)]} />,
    );
    expect(screen.getByRole("list")).toHaveClass("row");
    for (const item of screen.getAllByRole("listitem")) {
      expect(item).toHaveClass("col-12", "col-md-6", "col-lg-4");
    }
  });
});
