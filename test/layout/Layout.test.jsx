import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../renderWithProviders";
import { Layout } from "../../src/layout/Layout";
import { Route, Routes } from "react-router-dom";

describe("Layout", () => {
  it("shows header, navigation and footer", () => {
    renderWithProviders(<Layout />);
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders the current page inside the main landmark", () => {
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<p>page content</p>} />
        </Route>
      </Routes>
    );
    expect(screen.getByRole("main")).toHaveTextContent("page content");
  });
});
