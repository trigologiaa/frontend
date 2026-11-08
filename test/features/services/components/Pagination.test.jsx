import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Pagination } from "../../../../src/features/services/components/Pagination";
import { i18n } from "../../../../src/i18n";
import { renderWithProviders } from "../../../renderWithProviders";

describe("Pagination", () => {
  it("lists the pages and marks the current one", () => {
    renderWithProviders(<Pagination page={2} totalPages={3} onChange={() => {}} />);
    const nav = screen.getByRole("navigation", { name: "Paginación" });
    expect(within(nav).getByRole("button", { name: "Página 1" })).toBeInTheDocument();
    expect(within(nav).getByRole("button", { name: "Página 3" })).toBeInTheDocument();
    expect(within(nav).getByRole("button", { name: "Página 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(nav).getByRole("button", { name: "Página 1" })).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("moves one page with next and previous", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<Pagination page={2} totalPages={3} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Siguiente" }));
    expect(onChange).toHaveBeenLastCalledWith(3);
    await user.click(screen.getByRole("button", { name: "Anterior" }));
    expect(onChange).toHaveBeenLastCalledWith(1);
  });

  it("jumps to a numbered page", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(<Pagination page={1} totalPages={3} onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Página 3" }));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("disables previous on the first page and next on the last", () => {
    const { unmount } = renderWithProviders(
      <Pagination page={1} totalPages={3} onChange={() => {}} />,
    );
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeEnabled();
    unmount();
    renderWithProviders(<Pagination page={3} totalPages={3} onChange={() => {}} />);
    expect(screen.getByRole("button", { name: "Siguiente" })).toBeDisabled();
  });

  it("draws nothing when there is a single page", () => {
    renderWithProviders(<Pagination page={1} totalPages={1} onChange={() => {}} />);
    expect(screen.queryByRole("navigation")).not.toBeInTheDocument();
  });

  it("is translated to English", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<Pagination page={2} totalPages={3} onChange={() => {}} />);
    expect(screen.getByRole("navigation", { name: "Pagination" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Previous" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Page 2" })).toBeInTheDocument();
  });
});
