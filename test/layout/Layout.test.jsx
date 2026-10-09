import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../renderWithProviders";
import { Layout } from "../../src/layout/Layout";

describe("Layout", () => {
  it("shows header, navigation and footer", () => {
    renderWithProviders(<Layout />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });
});
