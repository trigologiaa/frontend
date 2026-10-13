import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../renderWithProviders";
import { LanguageSwitcher } from "../../src/layout/LanguageSwitcher";
import userEvent from "@testing-library/user-event";

describe("LanguageSwitcher", () => {
  it("offers ES and EN and marks the active language", () => {
    renderWithProviders(<LanguageSwitcher />);
    expect(screen.getByRole("button", { name: "ES" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "false");
  });

  it("remembers the chosen language", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LanguageSwitcher />);
    await user.click(screen.getByRole("button", { name: "EN" }));
    expect(localStorage.getItem("i18nextLng")).toBe("en");
  });
});
