import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../renderWithProviders";
import { NavBar } from "../../src/layout/NavBar";

describe("NavBar", () => {
  it("is a navigation landmark named 'Navegación principal'", () => {
    renderWithProviders(<NavBar />);
    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument();
  });
});
