import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AuthNav } from "../../../../src/features/auth/components/AuthNav";
import { renderWithProviders } from "../../../renderWithProviders";

describe("AuthNav", () => {
  it("offers sign in and registration to anonymous visitors", () => {
    renderWithProviders(<AuthNav />);
    expect(screen.getByRole("link", { name: "Iniciar sesión" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Crear cuenta" })).toHaveAttribute("href", "/registro");
    expect(screen.queryByRole("button", { name: "Cerrar sesión" })).not.toBeInTheDocument();
  });

  it("offers sign out to a signed-in user", async () => {
    const user = userEvent.setup();
    const signOut = vi.fn();
    renderWithProviders(<AuthNav />, {
      auth: { user: { uid: "u1", email: "ana@example.com" }, signOut },
    });
    expect(screen.queryByRole("link", { name: "Crear cuenta" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(signOut).toHaveBeenCalled();
  });

  it("renders nothing while the session is loading", () => {
    renderWithProviders(<AuthNav />, { auth: { loading: true } });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
