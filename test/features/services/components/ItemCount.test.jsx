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

  it("asks to increase the quantity by one", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<ItemCount value={3} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Aumentar cantidad" }));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
