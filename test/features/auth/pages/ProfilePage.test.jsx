import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProfilePage } from "../../../../src/features/auth/pages/ProfilePage";
import { i18n } from "../../../../src/i18n";
import { notify } from "../../../../src/shared/notify";
import { renderWithProviders } from "../../../renderWithProviders";

vi.mock("../../../../src/shared/notify", () => ({
  notify: { success: vi.fn(), error: vi.fn() },
}));

const ana = { uid: "1", email: "ana@example.com", role: "user" };

describe("ProfilePage", () => {
  it("greets the user by email", () => {
    renderWithProviders(<ProfilePage />, { auth: { user: ana } });
    expect(screen.getByRole("heading", { name: "Mi perfil" })).toBeInTheDocument();
    expect(screen.getByText("¡Hola de nuevo, ana@example.com!")).toBeInTheDocument();
  });

  it.each([
    ["user", "Cuenta de usuario"],
    ["admin", "Cuenta de administrador"],
  ])("shows the kind of account for the role %s", (role, text) => {
    renderWithProviders(<ProfilePage />, { auth: { user: { ...ana, role } } });
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("signs out and goes to the home page", async () => {
    const user = userEvent.setup();
    const signOut = vi.fn().mockResolvedValue();
    renderWithProviders(
      <Routes>
        <Route path="/" element={<p>Inicio de prueba</p>} />
        <Route path="/perfil" element={<ProfilePage />} />
      </Routes>,
      { route: "/perfil", auth: { user: ana, signOut } },
    );
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(signOut).toHaveBeenCalledTimes(1);
    expect(await screen.findByText("Inicio de prueba")).toBeInTheDocument();
  });

  it("is translated to English", async () => {
    await i18n.changeLanguage("en");
    renderWithProviders(<ProfilePage />, { auth: { user: ana } });
    expect(screen.getByText("Welcome back, ana@example.com!")).toBeInTheDocument();
    expect(screen.getByText("User account")).toBeInTheDocument();
  });

  it("shows a notice after signing out", async () => {
    const user = userEvent.setup();
    renderWithProviders(<ProfilePage />, {
      auth: { user: ana, signOut: vi.fn().mockResolvedValue() },
    });
    await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));
    expect(notify.success).toHaveBeenCalledWith("toast.signedOut");
  });
});
