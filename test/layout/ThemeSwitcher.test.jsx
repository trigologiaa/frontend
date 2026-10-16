import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { i18n } from "../../src/i18n";
import { ThemeSwitcher } from "../../src/layout/ThemeSwitcher";
import { renderWithProviders } from "../renderWithProviders";

describe("ThemeSwitcher", () => {
  it("is a selector named 'Tema' that shows the current theme", () => {
    renderWithProviders(<ThemeSwitcher />);
    expect(screen.getByRole("combobox", { name: "Tema" })).toHaveValue("mocha");
  });

  it("offers the four flavors in order", () => {
    renderWithProviders(<ThemeSwitcher />);
    expect(screen.getAllByRole("option").map((option) => option.textContent)).toEqual([
      "Latte (claro)",
      "Frappé (oscuro)",
      "Macchiato (oscuro)",
      "Mocha (oscuro)",
    ]);
  });

  it("applies the flavor that is chosen", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSwitcher />);
    await user.selectOptions(screen.getByRole("combobox", { name: "Tema" }), "frappe");
    expect(screen.getByRole("combobox", { name: "Tema" })).toHaveValue("frappe");
    expect(document.documentElement).toHaveAttribute("data-theme", "frappe");
    expect(localStorage.getItem("theme")).toBe("frappe");
  });

  it("is named and translated in English", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<ThemeSwitcher />);
    expect(screen.getByRole("combobox", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Macchiato (dark)" })).toBeInTheDocument();
  });

  it("can be reached with the keyboard", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ThemeSwitcher />);
    await user.tab();
    expect(screen.getByRole("combobox", { name: "Tema" })).toHaveFocus();
  });
});
