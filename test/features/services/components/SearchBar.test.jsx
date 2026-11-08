import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SearchBar } from "../../../../src/features/services/components/SearchBar";
import { renderWithProviders } from "../../../renderWithProviders";

describe("SearchBar", () => {
  it("is a labeled search field that shows the value", () => {
    renderWithProviders(<SearchBar value="react" onChange={() => {}} />);
    const field = screen.getByRole("searchbox", { name: "Buscar servicios" });
    expect(field).toHaveValue("react");
  });

  it("reports what the visitor types", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<SearchBar value="" onChange={onChange} />);
    await user.type(screen.getByRole("searchbox"), "a");
    expect(onChange).toHaveBeenCalledWith("a");
  });

  it("shows a magnifier without changing the field name", () => {
    const { container } = renderWithProviders(<SearchBar value="" onChange={() => {}} />);
    expect(screen.getByRole("searchbox", { name: "Buscar servicios" })).toBeInTheDocument();
    expect(container.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument();
  });
});
