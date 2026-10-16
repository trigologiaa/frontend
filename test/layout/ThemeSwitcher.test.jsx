import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ThemeSwitcher } from "../../src/layout/ThemeSwitcher";
import { renderWithProviders } from "../renderWithProviders";

describe("ThemeSwitcher", () => {
  it("is a selector named 'Tema' that shows the current theme", () => {
    renderWithProviders(<ThemeSwitcher />);
    expect(screen.getByRole("combobox", { name: "Tema" })).toHaveValue("mocha");
  });
});
