import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ItemCount } from "../../../../src/features/services/components/ItemCount";
import { renderWithProviders } from "../../../renderWithProviders";

describe("ItemCount", () => {
  it("shows the current quantity", () => {
    renderWithProviders(<ItemCount value={3} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Cantidad")).toHaveTextContent("3");
  });
});
