import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { renderWithProviders } from "../renderWithProviders";
import { NavBar } from "../../src/layout/NavBar";
import { notify } from "../../src/shared/notify";

vi.mock("../../src/shared/notify", () => ({
  notify: { success: vi.fn(), error: vi.fn() },
}));

describe("NavBar", () => {
  it("is a navigation landmark named 'Navegación principal'", () => {
    renderWithProviders(<NavBar />);
    expect(screen.getByRole("navigation", { name: "Navegación principal" })).toBeInTheDocument();
  });

  it("links to home, services and cart", () => {
    renderWithProviders(<NavBar />);
    expect(screen.getByRole("link", { name: "Inicio" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Servicios" })).toHaveAttribute("href", "/servicios");
    expect(screen.getByRole("link", { name: "Carrito" })).toHaveAttribute("href", "/carrito");
  });

  it("marks the current section as the current page", () => {
    renderWithProviders(<NavBar />, { route: "/servicios" });
    expect(screen.getByRole("link", { name: "Servicios" })).toHaveAttribute("aria-current", "page");
  });

  it("does not mark the other sections", () => {
    renderWithProviders(<NavBar />, { route: "/servicios" });
    expect(screen.getByRole("link", { name: "Inicio" })).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("link", { name: "Carrito" })).not.toHaveAttribute("aria-current");
  });

  it("shows the cart widget with the quantity", () => {
    renderWithProviders(<NavBar />, { cart: { totalQuantity: 2 } });
    expect(screen.getByRole("link", { name: "Carrito, 2 artículos" })).toHaveAttribute("href", "/carrito");
  });

  it("keeps the cart marked on the cart page", () => {
    renderWithProviders(<NavBar />, { route: "/carrito" });
    expect(screen.getByRole("link", { name: "Carrito" })).toHaveAttribute("aria-current", "page");
  });

  it("shows the management link only to admins", () => {
    const { unmount } = renderWithProviders(<NavBar />, {
      auth: { user: { uid: "2", email: "leo@example.com", role: "user" } },
    });
    expect(screen.queryByRole("link", { name: "Gestión" })).not.toBeInTheDocument();
    unmount();
    renderWithProviders(<NavBar />, {
      auth: { user: { uid: "1", email: "ana@example.com", role: "admin" } },
    });
    expect(screen.getByRole("link", { name: "Gestión" })).toHaveAttribute("href", "/admin");
  });

  it("links to the profile while signed in and not otherwise", () => {
    const { unmount } = renderWithProviders(<NavBar />);
    expect(screen.queryByRole("link", { name: "Mi perfil" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toBeInTheDocument();
    unmount();
    renderWithProviders(<NavBar />, {
      auth: { user: { uid: "1", email: "ana@example.com", role: "user" } },
    });
    expect(screen.getByRole("link", { name: "Mi perfil" })).toHaveAttribute("href", "/perfil");
    expect(screen.queryByRole("link", { name: "Iniciar sesión" })).not.toBeInTheDocument();
  });

  it("goes to the home page after signing out", async () => {
    const user = userEvent.setup();
    const signOut = vi.fn().mockResolvedValue();
    renderWithProviders(
      <Routes>
        <Route path="/" element={<p>Inicio de prueba</p>} />
        <Route path="/perfil" element={<NavBar />} />
      </Routes>,
      {
        route: "/perfil",
        auth: { user: { uid: "1", email: "ana@example.com", role: "user" }, signOut },
      },
    );
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(await screen.findByText("Inicio de prueba")).toBeInTheDocument();
  });

  it("draws an icon in each session link and keeps their names", () => {
    const { unmount } = renderWithProviders(<NavBar />);
    expect(
      screen.getByRole("link", { name: "Iniciar sesión" }).querySelector('svg[aria-hidden="true"]'),
    ).toBeInTheDocument();
    unmount();
    renderWithProviders(<NavBar />, {
      auth: { user: { uid: "1", email: "ana@example.com", role: "admin" } },
    });
    for (const name of ["Mi perfil", "Gestión"]) {
      expect(
        screen.getByRole("link", { name }).querySelector('svg[aria-hidden="true"]'),
      ).toBeInTheDocument();
    }
    expect(
      screen.getByRole("button", { name: "Cerrar sesión" }).querySelector('svg[aria-hidden="true"]'),
    ).toBeInTheDocument();
  });

  it("shows a notice after signing out from the navbar", async () => {
    const user = userEvent.setup();
    renderWithProviders(<NavBar />, {
      auth: {
        user: { uid: "1", email: "ana@example.com", role: "user" },
        signOut: vi.fn().mockResolvedValue(),
      },
    });
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(notify.success).toHaveBeenCalledWith("toast.signedOut");
  });
});
