import { act, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderWithProviders } from "../renderWithProviders";
import { Layout } from "../../src/layout/Layout";
import { notify } from "../../src/shared/notify";
import { lazy } from "react";
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

  it("shows notices anywhere in the site", async () => {
    renderWithProviders(<Layout />);
    act(() => {
      notify.success("toast.signedIn");
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("Sesión iniciada");
    expect(screen.getAllByRole("alert")).toHaveLength(1);
  });

  it("keeps the shell and shows a spinner while a lazy page loads", async () => {
    let release;
    const Slow = lazy(
      () =>
        new Promise((resolve) => {
          release = () => resolve({ default: () => <p>pagina lista</p> });
        }),
    );
    renderWithProviders(
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Slow />} />
        </Route>
      </Routes>,
    );
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toContainElement(screen.getByRole("status"));
    await act(async () => release());
    expect(await screen.findByText("pagina lista")).toBeInTheDocument();
    expect(screen.getByRole("banner")).toBeInTheDocument();
  });
});
