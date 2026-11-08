import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { i18n } from "../../src/i18n";
import { Spinner } from "../../src/shared/Spinner";
import spinnerCss from "../../src/shared/Spinner.module.css?raw";
import tokensCss from "../../src/styles/tokens.css?raw";
import { renderWithProviders } from "../renderWithProviders";

describe("Spinner", () => {
  it("is announced as a status with a text name", () => {
    renderWithProviders(<Spinner />);
    expect(screen.getByRole("status")).toHaveTextContent("Cargando...");
  });

  it("can be small", () => {
    renderWithProviders(<Spinner size="sm" />);
    expect(screen.getByRole("status").className).toMatch(/sm/);
  });

  it("is stopped by the global reduced motion rule", () => {
    expect(tokensCss).toMatch(/prefers-reduced-motion: reduce/);
    expect(spinnerCss).not.toMatch(/!important/);
  });

  it("is named in English", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<Spinner />);
    expect(screen.getByRole("status")).toHaveTextContent("Loading...");
  });
});
