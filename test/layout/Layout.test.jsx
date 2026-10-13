import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../renderWithProviders";
import { Layout } from "../../src/layout/Layout";
import { Route, Routes } from "react-router-dom";
import userEvent from "@testing-library/user-event";

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

  it("switches the navigation to English", async () => {
    const user = userEvent.setup();
    renderWithProviders(<Layout />);
    await user.click(screen.getByRole("button", { name: "EN" }));
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Services" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Cart" })).toBeInTheDocument();
  });
});
